<template lang="pug">
    el-menu.menu.el-menu-vertical-demo(:collapse="isCollapse" :defaultActive="position" :class="classMenu")
        .menu__info
            img(src="~assets/images/logo/logo-wabu-blue.png").menu__logo
            h2.menu__country
                em(v-if="country") PAÍS
                    span {{ country }}
                em(v-else) PAÍS
                    span No hay
        .menu__info
            .menu__box
                h4 {{ country }}
                .menu__user-data
                    h2 {{ firstName }} {{ lastName }}
                    h3 {{ role }}
                .menu__logout
                    el-tooltip(content="Salir" placement="right")
                        i.icon-ic-logout.menu__icon(@click="logout")
            .menu__university
                i.icon-ic-back-normal.back__menu-university(@click="back" v-if="!isUniversityAdmin")
                h3 {{ nickName }}
        div.menu__items-box
            el-menu-item.menu-item(v-for="(item, i) in items" :key="i" :index="item.index" @click="clickMenu(item)")
                i(:class="item.icon").submenu__icon
                span(slot="title") {{  item.name }}
            //- el-submenu(index="4" v-if="configuration").submenu
            //-     template(slot="title") 
            //-         i.icon-ic-config.submenu__icon
            //-         span(slot="title") CONFIGURACIÓN
            //-     el-menu-item-group
            //-         el-menu-item(index="4-1").submenu__item 
            //-             span COLABORADORES
            //-         el-menu-item(index="4-2").submenu__item 
            //-             span PUNTAJES
            //-         el-menu-item(index="4-3").submenu__item  
            //-             span NIVELES
            //-         el-menu-item(index="4-4").submenu__item 
            //-             span EMBLEMAS
            //-         el-menu-item(index="4-5").submenu__item 
            //-             span TERMINOS Y CONDICIONES
        .menu__collapse-btn(@click="toggleCollapse")
            i.icon-ic-menuollapse

</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
    props: ['menu-items', 'configuration', 'menu-type', 'back-route'],
    data() {
        let universitySelect = this.$route.params.university
        let countrySelect = this.$route.params.country
        return {
            items: this.menuItems,
            isCollapse: false,
            university: 'UPC',
            countrySelect: countrySelect,
            position: "1"
        }
    },
    methods: {
        clickMenu(item) {
            this.$router.push(item.route)
            this.$emit('changeView')
        },
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
            this.$emit('collapse', this.isCollapse)
        },
        back() {
            this.$router.push(this.backRoute)
        },
        async logout(){
            try {
                await this.$store.dispatch('account/authentication/logout')
                this.$router.push('/')
            } catch(error) {}
        }
    },
    computed: {
        ...mapState({
            'firstName': state => state.account.user.user.firstName,
            'lastName': state => state.account.user.user.lastName,
            'country': state => state.country.country.name,
            'nickName': state => state.university.detail.nickName
        }),
        ...mapGetters({
            'role': 'account/user/roleType',
            isGlobalAdmin: 'account/user/isGlobalAdmin',
            isCountryAdmin: 'account/user/isCountryAdmin',
            isUniversityAdmin: 'account/user/isUniversityAdmin'
        }),
        classMenu() {
            let extraClass 

            if(this.isGlobalAdmin) extraClass = 'isGlobalAdmin'
            else if(this.isCountryAdmin) extraClass = 'isCountryAdmin'
            else extraClass = 'isUniversityAdmin'

            return `menu--${this.menuType} ${extraClass}`
        }
    },
    created() {
        let routeName = this.$route.fullPath.split('/').pop().split('?').shift()
        let interns = ['detail', 'new', 'edit']
        if(interns.indexOf(routeName) !== -1) routeName = this.$route.fullPath.split('/').splice(-2, 1)
        this.menuItems.forEach((item, i) => {
            if(this.menuItems[i].englishName == routeName || this.menuItems[i].route == routeName) {
                this.position = this.menuItems[i].index ||  "1"
            }
        })
    }
}
</script>


<style lang="sass">
    $pl: 26px

    .hide-element
        opacity: 0
        position: absolute
        z-index: -1
    .show-element
        opacity: 1
        position: initial
        z-index: initial

    .back__menu-university
        cursor:
    .menu 
        border-right: 0 !important
        padding-top: 30px
        position: fixed !important
        bottom: 0
        top: 0
        left: 0
        width: 270px
        * 
            @include transition(.25s)
    .menu--university
    .menu__info
        display: flex
        flex-direction: column
        box-sizing: border-box
        &:first-child
            flex-direction: row
            align-items: flex-end
        &:nth-child(2) 
            justify-content: center
            height: 160px
            padding-top: 10px
    .menu__logo
        width: 60px
        padding-left: $pl
        align-self: center
        @include transition(.25s) 
    .menu__country
        @include transition(.25s)
        height: 51px
        border-left: 1px solid $gray
        margin-left: 15px
        padding-left: 13px
        letter-spacing: 0.36px
        display: flex
        flex-direction: column
        justify-content: flex-end
        em
            font-style: normal
            color: $gray
            font-family: $default-font
            font-weight: 100
            font-size: 10px
        span 
            font-weight: bold
            display: block
            font-family: $main-font
            letter-spacing: 0.2px
            font-size: 18px
            color: #415061
            -webkit-font-smoothing: antialiased
            font-style: normal
    .menu__box
        padding-bottom: 10px
        padding-left: $pl
        padding-right: 21px
        display: flex
        align-items: center
        justify-content: space-between
        h4 
            font-size: 0
            @include transition(.25s)
            @extend .hide-element
    .menu__user-data
        @include transition(.25s)
        h2 
            font-size: 17px
            letter-spacing: 0.34px
            font-weight: 600
        h3 
            font-size: 11px
            letter-spacing: 0.22px
            font-family: $default-font
            color: $gray
            font-weight: 100
            margin-top: 3px
    .menu__logout
        cursor: pointer
        align-self: end
        i
            color: $main-color 
            font-size: 24px
            @include transition(0.2s)
            &:hover 
                opacity: 0.8
    .menu__university
        display: flex
        padding-left: $pl
        align-items: center
        margin-left: -3px
        i 
            line-height: 1
            cursor: pointer
        h3 
            margin-left: 5px
            color: $main-color
            letter-spacing: 0.4px
            font-size: 20px
            font-weight: 600
            @include transition(.5s)
    .menu__items-box 
        overflow: auto
        height: calc(100vh - 280px)
    .menu-item
        padding-left: $pl !important
        height: 40px !important
        line-height: 40px !important
        margin-bottom: 10px
        &:before
            position: absolute
            height: 40px
            width: 4px
            background: transparent
            content: ''
            left: 0
            border-radius: 2px
            @include transition(0.25s)
        &.is-active
            &:before
                background: $main-color
            span 
                color: $main-color
    .submenu__icon
        font-size: 23px 
        margin-right: 15px
        max-height: 25px
        display: inline-block
        line-height: 1
        color: #6d7985 !important
    .el-menu-item.is-active
        background: #ecf5ff
        i
            color: #409EFF !important
    .el-menu-item span,
    .el-submenu .el-submenu__title
        font-size: 12px
        font-weight: 600
        letter-spacing: 0.72px
        text-transform: uppercase

    .el-submenu__title
        padding-left: $pl !important

    .el-submenu 
        .el-menu
            .el-menu-item-group__title
                display: none
    .submenu__item 
        height: 35px !important
        line-height: 35px !important
        padding-left: 65px !important
        span 
            opacity: 0.6
            font-size: 9px
            letter-spacing: 0.48px
            font-weight: 600

    .el-menu--vertical
        .el-menu-item-group__title
            display: none
        .submenu__item
            padding-left: 20px !important

    .menu__collapse-btn
        width: 28px
        height: 28px
        border-radius: 4px 0 0 0
        background-color: $main-color
        position: absolute
        bottom: 0
        right: 0
        cursor: pointer
        display: flex
        justify-content: center
        align-items: center
        i
            color: #ffffff
            position: relative
            top: 1px
            font-size: 16px
            line-height: 1
            @include transition(.25s)

    .el-menu--collapse
        width: 75px !important
        span
            display: none
        span + i
            display: none
        .menu__university
            display: none
        .menu__logo 
            width: 38px
            padding-left: 17px
        .menu__user-data
            display: none
        .menu-item
            .el-tooltip
                text-align: center
            .submenu__icon
                margin-right: 0
        .menu__collapse-btn
            i
                transform: rotate(-180deg)
        .menu__university
            padding-top: 10px
            padding: 0
            justify-content: center
            i 
                cursor: pointer
            h3 
                @extend .hide-element
        .menu__country
            @extend .hide-element
        .menu__box 
            flex-direction: column
            padding-bottom: 20px
            h4 
                font-size: 18px
                letter-spacing: 0.36px
                padding-bottom: 20px
                @extend .show-element

    .menu--global
        .menu__university,
        .menu__country
            display: none

    .menu--country
        .menu__university
            h3
                display: none 

    .menu--country.isCountryAdmin
        .back__menu-university
            display: none
    
</style>

