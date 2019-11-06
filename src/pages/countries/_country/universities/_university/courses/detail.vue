<template lang="pug">
    .detail__course
        h4.title__state-back
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            span.state_circle(:class="{'active': detail.status }")
            | {{ detail.name }}
            i.icon__edit.icon-ic-edit-normal(@click="edit")
        .detail__course-info
            ul
                li.detail__info
                    i.icon-ic-teacher
                    strong {{ countTeachers }}
                    p Profesores asociados
                li.detail__info
                    i.icon-ic-carreras
                    strong {{ countCareers }}
                    p Carreras asociadas
            .detail__course-code
                span Código de Curso
                strong {{ detail.code }}
        h3.subtitle__blue-general Carreras Asociadas
        ul( v-if="conditionalCareerAssociate").career__list-container
            li.career__list-item(v-for="career in detail.careers")
                p {{ career.name }}
                span {{ career.studyPlan.name }}
        div.message__no-data(v-else)
            h3 No tienes carreras asociados a este curso
        h3.subtitle__blue-general Profesores del curso
        div( v-if=" teachers != 0 "  )
            el-table.general__table.teacher__table(
                ref='multipleTable', 
                :data='teachers', 
                style='width: 100%', 
                @sort-change="sortChange"
            )
                el-table-column( sortable="custom" property='lastName', label='Nombre Apellido')
                    template(slot-scope='scope', align="center") 
                        span.teacher__fullname #[strong {{ scope.row.lastName }} ] {{ scope.row.firstName}}
                el-table-column( align="center" sortable="custom" property='isDictates', label='Dicta/Dictó', width='300')
                    template(slot-scope='scope', align="center") 
                        .state__teacher-container
                            span(v-if="scope.row.isDictates == awardStatus.ACTIVE") Dicta
                            span(v-else) Dictó
                el-table-column( align="center", sortable="custom", property='status', label='Estado', show-overflow-tooltip='' width='200')
                    template(slot-scope='scope', align="center") 
                        .state__teacher-container
                            .state__teachers( v-bind:class="{ 'active' : scope.row.status == 1 }" ) 
                            span {{ scope.row.status == 1 ? "activo" : "inactivo" }}


            pagination.course__pagination(
                v-if="showPagination"
                :currentPage="currentPage"
                :pageSize="pageSize"
                :pageCount="pageCount"
                layout="prev, pager, next, jumper"
                :total="total"
                @currentPage="pagination"
            )
        div.message__no-data(v-else)
            h3 No tienes profesores asociados a este curso
</template>
<script>
import pagination from '~/components/shared/pagination'
import { eventBus } from '~/event-bus'
import { mapState } from 'vuex'
import { awardStatus } from '~/enums'

export default {
    layout: 'university',
    components:{
        pagination
    },
    head: {
        title: 'Detalle del curso'
    },
    async fetch({store, query, app }) {
        try {
            store.commit('course/setSortDetail', { sortName: 'sortCode', isAscending: -1 })
            let pageDetail = query.pageDetail ? Number(query.pageDetail) : 1
            store.commit('course/setPaginationDetail', pageDetail)
            await store.dispatch('course/getDetail', query.id)
            await store.dispatch('course/findDetailTeacher', query.id)
        } catch(error) {
            store.dispatch('catchError', error)
        }
    },
    data(){
        return {
            awardStatus,
            careers: [
                {
                    name: 'Arte, Moda y Diseño Textil',
                    cicle: 'Ciclo 6'
                },
                {
                    name: 'Cración y Producción Escénica',
                    cicle: 'Ciclo 6'
                },
                {
                    name: 'Diseño Gráfico',
                    cicle: 'Ciclo 6'
                },
            ],
            multipleSelection: [],
            courseTitle: '',
            openSearch: false,
            search: '',
            removeOverlay: false,
            course: {},
            courseTitle: "",
            prevPage: '',
            showPagination: true
        }
    },
    computed: {
        ...mapState({
            'detail': state => state.course.detail,
            'teachers': state => state.course.listTeacherByDetail,
            'pageSize': state => state.course.limitDetail,
            'pageCount': state => state.course.totalPageDetail,
            'total': state => state.course.totalTeachersDetail,
            'currentPage': state => state.course.pageDetail
        }),
        countTeachers() {
            return this.teachers.length !== 0 ? '0' + this.teachers.length : '00'
        },
        countCareers() {
            return this.detail.careers.length !== 0 ? '0' + this.detail.careers.length : '00'
        },
        conditionalCareerAssociate() {
            if(this.detail.careers.length == 0)
                return false
            else 
                return true
        }
    },
    methods: {
        async pagination(val) {
            let id = this.$route.query.id
            let page = this.$route.query.page || 1
            this.$store.commit('course/setPaginationDetail', val)
            await this.$store.dispatch('course/findDetailTeacher', this.$route.query.id)
            this.$router.push({
                query: {
                    id: id,
                    page: page,
                    pageDetail: val
                }
            })
        },
        async sortChange(val) {
            if(this.$route.query.id) {
                let isAscending = val.order == "ascending" ? 1 : -1
                let sortName
                
                switch(val.prop) {
                    case 'lastName': 
                        sortName = 'sortFirstNameDetail'; break
                    case 'status': 
                        sortName = 'sortStatusDetail'; break
                    default: 
                        return
                }

                this.$store.commit('course/setSortDetail', { sortName, isAscending })
                await this.$store.dispatch('course/findDetailTeacher', this.$route.query.id)
            }

        },
        edit() {
            this.$router.push({
                path: `/countries/${this.$route.params.country}/universities/${this.$route.params.university}/courses/edit`,
				query: {
					idCourse: this.$route.query.id,
                    page: this.$route.query.page
				}
			})
        }
    },
    watch: {
        pageCount(val) {
            if(val <= 1) {
                this.showPagination = false
            } else {
                this.showPagination = true
            }
        }
    },
    mounted(){
        eventBus.$on('openDetailCourse', (val) => {
            this.courseTitle = "Nombre del curso"
        })
        this.$nextTick(() => {
            this.showPagination = this.$store.state.course.totalPageDetail <= 1 ? false : true

            let country = this.$route.params.country
            let university = this.$route.params.university
            let page = this.$route.query.page ? `${this.$route.query.page}` : ''
            let term = this.$route.query.term ? `${this.$route.query.term}` : ''
            this.prevPage = `/countries/${country}/universities/${university}/courses?page=${page}&term=${term}`
        })
    },
}
</script>
<style lang="sass">

</style>
