<template lang="pug">
    .detail
        .detail
            h4.title__state-back
                nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
                span.state_circle(:class="{'active': detail.status }")
                | {{ detail.firstName }} {{ detail.lastName }}
                i.icon__edit.icon-ic-edit-normal(@click="edit(1)")
        .detail__general-info
            div
                img(:src="detail.url") 
            div.ml-24.mt-8
                h3.subtitle__blue-general.f11 Código del profesor 
                p.code.fz-20.bold.smoothing-antialiased(v-if="detail.code") {{ detail.code }}
                p.code.fz-20.bold.smoothing-antialiased(v-else) -

                div.courses-associated.mt-16
                    i.icon-ic-cursos.fz-16
                    span.bold.ml-4 {{ detail.associatedCourse }}
                    p.ml-12 Cursos Asociados
            div.ml-64.mt-8
                h3.subtitle__blue-general.f11 Correo
                p.fz-20.bold.smoothing-antialiased(v-if="detail.email") {{ detail.email }}
                p.fz-20.bold.smoothing-antialiased(v-else) -
        .detail__courses-dictates
            h2.subtitle__blue-general.f20.smoothing-antialiased Cursos que dicta
                i.icon__edit.icon-ic-edit-normal(@click="edit(2)")
            div.flex-layout.info-box-container
                p(v-if="!detail.coursesDictates.length").no-data.mt-24.ml-8 No tienes cursos asociados
                infoBox(
                    v-else 
                    v-for="(course, i) in detail.coursesDictates" 
                    :key="i"
                    :item="course" 
                )
                p(v-else).no-data.mt-24.ml-8 No tienes cursos asociados
        .detail__courses-dictated 
            h2.subtitle__blue-general.f20.smoothing-antialiased Cursos que dictó 
                i.icon__edit.icon-ic-edit-normal(@click="edit(3)")
            div.flex-layout.info-box-container
                p(v-if="!detail.coursesDictated.length").no-data.mt-24.ml-8 No tienes cursos asociados
                infoBox(
                    v-else 
                    v-for="(course, i) in detail.coursesDictated" 
                    :key="i"
                    :item="course"
                )
</template>

<script>
import infoBox from '~/components/teachers/especific-info'
import { mapState } from 'vuex'

export default {
    layout: 'university',
    head: {
        title: 'Detalle'
    },
    components: {
        infoBox
    },
    async fetch({ store, params, query }) {
        try {
            await store.dispatch('teacher/getDetail', query.id)
        } catch(error) {
            store.dispatch('catchError', error)
        }
    },
    data() {
        return {
            imageUrl: 'https://www.recreoviral.com/wp-content/uploads/2017/01/Perritos-tazas-de-te-4.jpg',
            prevPage: '',
        }
    },
    methods: {
        edit(val) {
            this.$router.push({
                path: `/countries/${this.$route.params.country}/universities/${this.$route.params.university}/teachers/edit`,
				query: {
                    idTeacher: this.$route.query.id,
                    type: val,
                    page: this.$route.query.page
				}
			})
        }
    },
    computed: {
        ...mapState({
            detail: state => state.teacher.detail
        })
    },
    mounted() {
        this.$nextTick(() => {
            let params = this.$route.params
            let term = this.$route.query.term ? `${this.$route.query.term}` : ''
            this.prevPage = `/countries/${params.country}/universities/${params.university}/teachers?page=${this.$route.query.page}&term=${term}`
        }) 
    }
}
</script>

<style lang="sass" scoped>
    .detail__general-info
        padding-top: 10px
        display: flex
        img 
            width: 120px
            height: 120px
            border-radius: 12px
            object-fit: cover
        .flex-layout 
            // margin-right: 62px
        .subtitle__blue-general
            margin-bottom: 5px !important
            opacity: 0.7
            letter-spacing: 0.45px
        .courses-associated
            display: flex
            i 
                color: $main-color 
            span
                font-size: 14px
            p
                font-family: $default-font
                font-size: 14px
    .subtitle__blue-general
        font-weight: 600
    .detail__courses-dictates,
    .detail__courses-dictated
        padding-top: 52px
        // padding-bottom: 20px
        h2 
            position: relative
            i 
                top: 0
    .info-box-container
        flex-wrap: wrap
        margin-left: -8px
        margin-right: -8px
        .especific-info-box
            margin: 8px
</style>


