<template lang="pug"> 
    div
        div.countries
            h1.title Países
            ul.countries__grid.grid__box( v-if="")
                li(v-for="(item, i) in countries.countries" :key="item._id" @click="enterCountry(item)").grid__item
                    el-card.country.grid__card
                        .country__title
                            h2.title-secondary {{ item.name }}
                            img(:src="item.url")
                        ul.data__box
                            li #[strong {{ item.countCollege }}] Universidades
                            li #[strong {{ item.countStudent }}] Alumnos
                        i.icon-ic-next-normal.icon-go
            div(v-if="!countriesExist")
                h3.no__data-message No tienes ningun pais ingresado
        pagination(
            v-if="showPagination"
            :pageSize="pageSize"
            :pageCount="pageCount"
            layout="prev, pager, next, jumper"
            :total="total"
            @currentPage="pagination"
        )
</template>

<script>
import pagination from '~/components/shared/pagination'
import { mapState } from 'vuex'

export default {
    layout: 'global',
    head: {
        title: 'Países'
    },
    components: {
        pagination
    },
    async fetch({store, app, query, redirect}) {
        let idCountry
        if(store.getters['account/user/isCountryAdmin']) {
            idCountry = store.state.account.user.user.countries[0]
            redirect(`/countries/${idCountry}/universities`)
        } else if(store.getters['account/user/isUniversityAdmin']) {
            idCountry = store.state.account.user.user.countries[0]
            let idCollege = store.state.account.user.user.colleges[0]
            redirect(`/countries/${idCountry}/universities/${idCollege}`)
        } else {
            let page = query.page ? Number(query.page) : 1
            try {
                store.commit('country/setPagination', page)
                await store.dispatch('country/getListAdmin')
            } catch(error) {
                this.$store.dispatch('catchError', error)
            }
        }
    },
    data() {
        return {
            showPagination: ''
        }
    },
    methods: {
        enterCountry(country) {
            this.$store.dispatch('country/setCountry', country)
            this.$router.push(`/countries/${country._id}`)
        },
        async pagination(val) {
            this.$store.commit('country/setPagination', val)
            await this.$store.dispatch('country/getListAdmin')
            this.$router.push({
                query: {page : val}
            })
        },
        openAlert(){
            
        }
    },
    computed: {
        ...mapState({
            countries: state => state.country.countries,
        }),
        pageSize() {
            return 10
        },
        pageCount() {
            return this.$store.state.country.totalPage
        },
        total() {
            return this.$store.state.country.countRecord
        },
        countriesExist() {
            return Object.keys(this.countries).length ? this.countries.countries.length : false
        }
    },
    mounted(){
        this.$nextTick(() => {
            if(this.$store.state.country.totalPage == 1) {
                this.showPagination = false
            } else {
                this.showPagination = true
            }
        })
    }
}
</script>

<style lang="sass">
    .countries
        h1
            margin-bottom: 25px
    .countries__grid
        max-width: 950px
    .country 
        width: 280px
        height: 190px
        .el-card__body
            padding: 24px 26px
            position: relative
            i 
                position: absolute
                right: 28px
                bottom: 30px
        img
            height: 20px
            width: 20px
            box-shadow: 1px 1px 1px 0 rgba(0,0,0,0.15)
            border-radius: 50%
            align-self: center

    .country__title
        display: flex
        padding-bottom: 46px
        h2 
            margin-right: 10px
    
</style>
