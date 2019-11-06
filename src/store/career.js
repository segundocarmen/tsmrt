import { apiCareerList, apiCareerDetail, apiCareerFacultiesByIdCollege, apiCareerByIdCollege, apiCareerCreate, apiFindCareerByTerm, apiUpdateCareer} from '../api/career'
import { termStatus, typeCicleEnum, crudStatus, sort  } from '~/enums'

export const state = () => ({
    career: [],
    carrerByIdCollege: [],
    detail: {},
    term: termStatus.NEGATIVE,
    page: 1,
    limit: 10,
    totalPage: null,
    totalCareer: null,
    listFaculties: [],
    sortName: sort.ASC,
    listCareer: [],
    detailForEdit: {}
}) 

export const mutations = {
    setSort(state) {
        state.sortName = sort.ASC
    },
    setCareer(state, data) {
        state.totalCareer = data.countRecord
        state.totalPage = data.countPage
        if(Array.isArray(data.career))
            state.career = data.career.map(item => ({
                id: item._id,
                name: item.name,
                cicles: item.countCicles,
                courses: item.countCourses || 0,
                students: item.countStudents || 0
            }))
        else
            state.career = []
    },
    setCarrerByIdCollege(state, data) {
        state.carrerByIdCollege = data
    },
    setTerm(state, data) {
        state.term = data
    },
    setPagination(state, currentPage) {
        state.page = currentPage
    },
    setComboFaculties(state, data) {
        state.listFaculties = data.map(item => ({
            name: item.name,
            value: item 
        }))
    },
    setDetail(state, data) {
        if(data) {
            let newArray = []
            if(data.studyPlan) {
                let cicles = data.studyPlan.filter(i => i.typeCicle !== typeCicleEnum.ELECTIVE && i.typeCicle !== typeCicleEnum.ZERO)
                let coursesElectivos = data.studyPlan.filter(i => i.typeCicle == typeCicleEnum.ELECTIVE)
                let coursesCicleZero = data.studyPlan.filter(i => i.typeCicle == typeCicleEnum.ZERO)
                newArray.push(...coursesCicleZero, ...cicles, ...coursesElectivos)
                state.detail = {
                    name: data.name,
                    code: data.code,
                    countCicles: data.countCicles,
                    countCourses: data.countCourses,
                    isCicleZero: data.isCicleZero,
                    studyPlan: newArray
                }
            }
        } else {
            state.detail = data
        }
    },
    setSortName(state, sortName) {
        state.sortName = sortName
    },
    setComboCarrers(state, data) {
        state.listCareer = data.map(item => ({
			id: item._id,
            name: item.name,
            studyPlan: item.studyPlan,
            typeOperation: crudStatus.CREATED           
        }))
    },
    setDetailForEdit(state, data) {
        let cicles = data.studyPlan.filter(i => i.typeCicle !== typeCicleEnum.ELECTIVE && i.typeCicle !== typeCicleEnum.ZERO)
        let coursesElectivos = data.studyPlan.filter(i => i.typeCicle == typeCicleEnum.ELECTIVE)
        let coursesCicleZero = data.studyPlan.filter(i => i.typeCicle == typeCicleEnum.ZERO)
        state.detailForEdit = {
            code: data.code,
            countCicles: data.countCicles,
            faculty: data.faculty,
            isCicleZero: data.isCicleZero,
            name: data.name,
            studyPlan: cicles.map(item => ({
                    name: item.name,
                    idStudyPlan: item.idStudyPlan,
                    typeCicle: item.typeCicle || typeCicleEnum.REGULAR,
                    typeOperation:  crudStatus.ORIGINAL,
                    position: item.position,
                    courses: item.courses.map(i => ({
                        idCourse: i.idCourse,
                        name: i.name,
                        code: i.code,
                        typeOperation: 0
                }))
            })),
            coursesElectivos: coursesElectivos.map(item => ({
                    name: item.name,
                    idStudyPlan: item.idStudyPlan,
                    typeCicle: item.typeCicle || typeCicleEnum.ELECTIVE,
                    typeOperation:  crudStatus.ORIGINAL,
                    courses: item.courses.map(i => ({
                        idCourse: i.idCourse,
                        name: i.name,
                        code: i.code,
                        typeOperation: 0 
                }))
            })),
            coursesCicleZero: coursesCicleZero.map(item => ({
                name: item.name,
                idStudyPlan: item.idStudyPlan,
                typeCicle: item.typeCicle || typeCicleEnum.ZERO, 
                typeOperation:  crudStatus.ORIGINAL,
                courses: item.courses.map(i => ({
                    idCourse: i.idCourse,
                    name: i.name,
                    code: i.code,
                    typeOperation: 0
            }))
        })),
        }
    }
}

export const actions = {
    async getList({commit, state, rootState}, id) {
        try {
            let response = await apiCareerByIdCollege(this.$axios, id, state.term, state.limit, state.page, state.sortName)
            commit('setCareer', response)
        } catch(error) {
            commit('setCareer', [])
        }
    },
    async getDetail({ commit }, data) {
        let conditional = data.page ? 'setDetailForEdit' :'setDetail'
        try {
            commit(conditional, await apiCareerDetail(this.$axios, data.id))
        } catch(error) {
            commit(conditional, [])
        }
    },
    async getListByIdCollege({commit, rootState}) {
        try {
            let response = await apiCareerFacultiesByIdCollege(this.$axios, id)
            commit('setCarrerByIdCollege', response)
        } catch(error) {
            commit('setCarrerByIdCollege', [])
        }
    },

    async create({}, {name, code, countCicles, isCicleZero, idCollege, idFaculty, studyPlan}) {
        await apiCareerCreate(this.$axios, {name, code, countCicles, isCicleZero, idCollege, idFaculty, studyPlan})
    },

    async comboFaculties({commit, state}, id) {
        try {
            commit('setComboFaculties', await apiCareerFacultiesByIdCollege(this.$axios, id))
        } catch(error) {
            commit('setComboFaculties', [])
        }
    },
    async findCareerForCourses({commit}, data) {
        try {
            let response = await apiFindCareerByTerm(this.$axios, data.id, data.term)
            commit('setComboCarrers', response)
        } catch(error) {
            commit('setComboTeachers', [])
        }
    },

    async update({}, data) {
        await apiUpdateCareer(this.$axios, data)
    } 
}