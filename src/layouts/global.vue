<template lang="pug">
    div#app
        el-container
            el-aside( :class="{ 'el-aside--collapse' : isCollapse }")
                wabuMenu(
                    @collapse="toggleCollapse",
                    :menu-items="menuItems", 
                    :configuration="showConfiguration", 
                    :menu-type="menuType"
                )
            el-container.main-container
                el-main
                    nuxt 
        alert-modal(ref="alertModal")
</template>

<script>
import wabuMenu from '~/components/shared/menu'
import AlertModal from '~/components/modals/alert'
import { eventBus } from '~/event-bus'

export default { 
    components: {
        wabuMenu,
        AlertModal
    },
    data() {
        return {
            isCollapse: false,
            menuItems: [
                { name: 'Reportes', englishName: 'reports', route: '/reports', icon: 'icon-ic-report', index: '1' },
                { name: 'Paises', englishName: 'countries', route: '/countries', icon: 'icon-ic-paises', index: '2' },
                // { name: 'Mensajería', englishName: 'messenger-service', route: '/messenger-service', icon: 'icon-ic-mensajes', index: '3' }
            ],
            showConfiguration: true,
            menuType: 'global'
        }
    }, 
    methods: {
        toggleCollapse(val) {
            this.isCollapse = val
        }
    },
    mounted() {
        this.$nextTick(function () {
            eventBus.$on('alertModal', () => this.$refs.alertModal.open())
        })
    },
    destroyed() {
        eventBus.$off('alertModal')
    }
}
</script>


