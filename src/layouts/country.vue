<template lang="pug">
    div#app
        el-container
            el-aside( :class="{ 'el-aside--collapse' : isCollapse }")
                wabuMenu(
                    @collapse="toggleCollapse" 
                    :menu-items="menuItems" 
                    :configuration="showConfiguration" 
                    :menu-type="menuType" 
                    :back-route="backRoute"
                )
            el-container.main-container
                el-main
                    nuxt 
        alert-modal(ref="alertModal")
        confirm-modal(ref="confirmModal")
</template>

<script>
import wabuMenu from '~/components/shared/menu'
import { mapState } from 'vuex'
import AlertModal from '~/components/modals/alert'
import confirmModal from '~/components/modals/general'
import { eventBus } from '~/event-bus'

export default {
    components: {
        wabuMenu,
        AlertModal,
        confirmModal
    },
    data() {
        let countrySelect = this.$route.params.country
        return {
            isCollapse: false,
            menuItems: [
                { name: 'Reportes', englishName: 'reports', route: `/countries/${countrySelect}/reports`, icon: 'icon-ic-report', index: '1' },
                { name: 'Universidades', englishName: 'universities', route: `/countries/${countrySelect}/universities`, icon: 'icon-ic-universidades', index: '2' },
                { name: 'Solicitudes', englishName: 'requests', route: `/countries/${countrySelect}/requests`, icon: 'icon-ic-solicitudes', index: '3' },
                { name: 'Premios', englishName: 'awards', route: `/countries/${countrySelect}/awards`, icon: 'icon-ic-sponsor', index: '4' },
                { name: 'Descuentos', englishName: 'discounts', route: `/countries/${countrySelect}/discounts`, icon: 'icon-ic-discount', index: '5' },
                { name: 'Términos', englishName: 'terms', route: `/countries/${countrySelect}/terms`, icon: 'icon-ic-legal', index: '6' }
            ],
            showConfiguration: false,
            menuType: "country",
            backRoute: '/countries'
        }
    },
    methods: {
        toggleCollapse(val) {
            this.isCollapse = val
        }
    },
    computed: {
        ...mapState({
            //country: state => state.country.country
        })
    },
    mounted() {
        this.$nextTick(function () {
            eventBus.$on('alertModal', () => this.$refs.alertModal.open()),
            eventBus.$on('confirm', () => this.$refs.confirmModal.open())
            eventBus.$on('closeConfirm', () => this.$refs.confirmModal.close())
        })
    },
    destroyed() {
        eventBus.$off('alertModal')
        eventBus.$off('confirm')
        eventBus.$off('closeConfirm')
    }
}
</script>


<style lang="sass">
    
</style>

