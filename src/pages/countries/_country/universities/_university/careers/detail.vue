<template lang="pug">
	.detail__career
		h4.title__state-back
			nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
			| {{ career.name }}
			i.icon__edit.icon-ic-edit-normal(@click="edit")
		.detail__course-info
			ul
				li.detail__info
					i.icon-ic-alumno
					strong {{ countStudents }}
					p Alumnos en la carrera
				li.detail__info
					i.icon-ic-cursos
					strong {{ countCourses }}
					p Cursos
				li.detail__info
					i.icon-ic-ciclo
					strong {{ countCicles }}
					p Ciclos
			.detail__career-code
				span Código de Carrera
				strong {{ career.code }}
		.detail__card-container
			no-ssr
				masonry(
					:cols="{ default: 6, 2300: 5, 2000: 4, 1700: 3, 1300: 2, 900: 1 }"
					:gutter="{ default: '30px', 700: '15px'}" 
				).detail__career_cards
					.card__content(v-for="(cicle, i) in career.studyPlan" )
						h3.subtitle__blue-general(v-if="career.studyPlan[i]") {{ career.studyPlan[i].name }}
						h3.subtitle__blue-general(v-else) Ciclo {{ i + 1 }}
						ul(v-if="isHaveCourse[i]")
							li.detail__career-item( v-for="(course, i) in courses[i]")
								span {{ course.code }}
								h4 {{ course.name }}
						p.non__courses(v-else) No existen cursos asignados a este ciclo.
</template>
<script>
import { mapState } from 'vuex'

export default {
    layout: 'university',
    head: {
        title: 'Detalle de carrera'
    },
    async fetch({ store, query }){
        await store.dispatch('career/getDetail', {id: query.id})
    },
    data(){
        let country = this.$route.params.country
        let university = this.$route.params.university
		let page = this.$route.query.page ? `?page=${this.$route.query.page}` : ''
        return {
            cicleCount: '',
            prevPage: '',
			condition: false
        }
    },
    computed: {
        ...mapState({
            'career': state => state.career.detail
        }),
        countStudents() {
            return this.career.countStudents ? '0' + this.career.countStudents : '00'
        },
        countCourses() {
            return this.career.countCourses ? '0' + this.career.countCourses : '00'
        },
        countCicles() {
            return this.career.countCicles ? '0' + this.career.countCicles : '00'
        },
		isHaveCourse() {
			if(this.career.studyPlan.length > 0) {
				return this.career.studyPlan.map(item => {
					if(item.courses.length > 0){
						return true
					} else {
				 		return false
				}
				})
			} else {
				return false
			}
		},
		courses() {
			return this.career.studyPlan.map(item => {
				if(item.courses.length > 0){
					return item.courses
				} else {
					return false
				}
			})
		}
    },
	methods: {
		edit() {
			this.$router.push({
                path: `/countries/${this.$route.params.country}/universities/${this.$route.params.university}/careers/edit`,
				query: {
					idCareer: this.$route.query.id,
					page: this.$route.query.page
				}
			})
		}
	},
	mounted(){
		let params = this.$route.params
		let page = this.$route.query.page ? `${this.$route.query.page}` : ''
        let term = this.$route.query.term ? `${this.$route.query.term}` : ''
		this.prevPage =  `/countries/${params.country}/universities/${params.university}/careers?page=${page}&term=${term}`
	} 
}
</script>
<style lang="sass">
	.detail__info
		&:first-child
			i
				font-size: 15px
		&:last-child
			i
				font-size: 13px
		strong
			font-size: 14px
			font-family: $default-font
			color: #2C363F
			font-weight: bold
			letter-spacing: 0.28px
		p
			font-weight: normal
			font-family: $default-font
			font-size: 14px
			letter-spacing: 0.53px
			line-height: 14px
	.detail__career-item
		flex-basis: 33.33%
		font-family: $default-font
		margin-bottom: 4px
		span
			font-size: 8px
			letter-spacing: 0.19px
			line-height: 11px
			text-transform: uppercase
		h4
			font-weight: normal
			line-height: 19px
			letter-spacing: 0.28px
			font-size: 14px
			color: #415061
			-webkit-font-smoothing: antialiased
	.non__courses
		font-family: $default-font
		font-size: 14px
		letter-spacing: 0.28px
		padding-left: 10px
		-webkit-font-smoothing: antialiased

	.detail__card-container
		display: flex
		margin-top: 35px

	.detail__career_cards
		width: 100%
		&:last-child
			margin-right: 0
		.subtitle__blue-general
			margin-bottom: 5px
			font-size: 16px
			font-weight: 600
		p
			font-size: 14px
			letter-spacing: 0.28px
			line-height: 20px
			color: #415061
			font-family: $default-font
			margin-top: 25px
		ul
			padding-left: 10px
			width: 100%
			margin-right: 30px
			&:nth-child(3)
					margin-right: 0
		.card__content
			padding: 20px 30px
			box-sizing: border-box
			margin-bottom: 30px
			background: #fff
			border: 1px solid #ebeef5
			border-radius: 7.58px
			min-height: 186px
			min-width: 280px
			width: 280px
	.detail__career-code
		display: flex
		flex-direction: column
		align-items: flex-end
		span
			color: #7B8FA0
			font-size: 10px
			opacity: 0.7
			letter-spacing: 0.45px
			font-family: $default-font
			margin-bottom: 3px
			display: inline-block
		strong
			letter-spacing: 0.4px
			line-height: 23px
			font-size: 20px
			color: #415061
			font-weight: normal
			text-transform: uppercase
		strong
			color: #415061
	.detail__course-info
		align-items: flex-end
		li
			&:last-child
				margin-bottom: 0
	.text_capitalize
		text-transform: capitalize !important
</style>


