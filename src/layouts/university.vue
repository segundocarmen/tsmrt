<template lang="pug">
    div#app
        el-container
            el-aside( :class="{ 'el-aside--collapse' : isCollapse }")
                wabuMenu(
                    @collapse="toggleCollapse", 
                    :menu-items="menuItems", 
                    :configuration="showConfiguration", 
                    :menu-type="menuType"
                    :back-route="backRoute"
                )
            el-container.main-container
                el-main
                    nuxt 
        alert-modal(ref="alertModal")
        prueba-modal(ref="pruebaModal")
</template>

<script>
import wabuMenu from '~/components/shared/menu'
import AlertModal from '~/components/modals/alert'
import PruebaModal from '~/components/modals/alert'
import showServerErrorMessage from '~/mixins/show-server-error-message'
import { eventBus } from '~/event-bus'

export default {
    components: {
        wabuMenu,
        AlertModal,
        PruebaModal
    },
    data() {
        let countrySelect = this.$route.params.country
        let universitySelect = this.$route.params.university
        let page = this.$route.query.page ? `?page=${this.$route.query.page}` : `?page=1`
        let term = this.$route.query.term ? `&term=${this.$route.query.term}` : ''
        return {
            isCollapse: false,
            menuItems: [
                { name: 'Inicio', englishName: '', route: `/countries/${countrySelect}/universities/${universitySelect}/`, icon: 'icon-ic-home', index: '1' },
                { name: 'Reportes', englishName: 'reports', route: `/countries/${countrySelect}/universities/${universitySelect}/reports`, icon: 'icon-ic-report', index: '2' },
                { name: 'Carreras', englishName: 'careers', route: `/countries/${countrySelect}/universities/${universitySelect}/careers` , icon: 'icon-ic-carreras', index: '3' },
                { name: 'Cursos', englishName: 'courses', route: `/countries/${countrySelect}/universities/${universitySelect}/courses`, icon: 'icon-ic-cursos', index: '4' },
                { name: 'Profesores', englishName:'teachers', route: `/countries/${countrySelect}/universities/${universitySelect}/teachers`, icon: 'icon-ic-teacher', index: '5' },
                { name: 'Alumnos', englishName:'students', route: `/countries/${countrySelect}/universities/${universitySelect}/students`, icon: 'icon-ic-alumno', index: '6' },
                { name: 'Contenido', englishName:'content', route: `/countries/${countrySelect}/universities/${universitySelect}/content`, icon: 'icon-ic-doc', index: '7' },
                { name: 'Comentarios SPAM', englishName:'spam', route: `/countries/${countrySelect}/universities/${universitySelect}/spam`, icon: 'icon-ic-spam', index: '8' },
                { name: 'Preguntas', englishName: 'questions', route: `/countries/${countrySelect}/universities/${universitySelect}/questions`, icon: 'icon-ic-preguntas', index: '9' },
                { name: 'Puntos', englishName: 'points', route: `/countries/${countrySelect}/universities/${universitySelect}/points`, icon: 'icon-ic-points-normal', index: '10' }
            ],
            showConfiguration: false,
            menuType: 'university',
            backRoute: `/countries/${this.$route.params.country}/universities${page}${term}`
        }
    },
    methods: {
        toggleCollapse(val) {
            this.isCollapse = val
        }
    },
    mounted() {
        this.$nextTick(function () {
            eventBus.$on('alertModal', () => {
                console.log('inAlert')
                this.$refs.alertModal.open()
            })
            eventBus.$on('alert', () => this.$refs.pruebaModal.open())

        })
    },
    destroyed() {
        eventBus.$off('alertModal')
        eventBus.$off('alert')
    }
}
</script>

