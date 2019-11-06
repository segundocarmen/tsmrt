import { 
    apiFindTeacher, 
    apiTeacherList, 
    apiTeacherUpdateStatus,
    apiTeacherCreate, 
    apiTeacherUploadFile,
    apiTeacherUpdate,
    apiTeacherUpdateCourses,
    apiTeacherDetail, 
    apiTeacherDetailCourses,
    apiUpdateImageUrl
} from '../api/teacher'

import { apiCourseDictadesOrDictated } from '../api/course'
import { status, genre, crudStatus, termStatus, sort } from '~/enums'

export const state = () => ({
    list: [],
    detail: {},
    listTeachersByCourse: [],
    listComboCareerByTeacher: [],
    listCareerByTeacher: [],
    term: termStatus.NEGATIVE,
    page: 1,
    limit: 10,
    sortCode: 0,
    sortName: sort.ASC,
    sortEmail: 0,
    sortStatus: 0,
    totalPage: null,
    totalCourses: null,
    pageDetail: 1,
    limitDetail: 6,
    idTeacher: ''
})

export const mutations = {
    setTerm(state, data) {
        state.term = data
    },
    setTeachers(state, data) {
        state.totalCourses = data.countRecord
        state.totalPage = data.countPage
        state.list = (Array.isArray(data.teachers) ?  data.teachers : []).map(item => ({  
            idTeacher: item.idTeacher,
            code: item.code ? item.code : '-',
            name: item.name ? item.name : item.firstName + ' ' + item.lastName,
            email: item.email ? item.email : '-',
            gender: item.gender,
            url: item.url,
            operation: item.operation,
            observation: item.observation,
            status: item.status == status.ACTIVE ? true : false,
            associatedCourses: item.associatedCourses ? item.associatedCourses : '00' ,

        }))
    },
    setPagination(state, currentPage) {
        state.page = currentPage
    },
    setDetail(state, data) {
        state.detail = data
    },
    setSort(state, { sortName, isAscending }) {
        state.sortCode = sortName == 'sortCode' ? isAscending : 0
        state.sortName = sortName == 'sortName' ? isAscending : 0
        state.sortStatus = sortName == 'sortStatus' ? isAscending : 0
    },
    setComboTeachersByCourse(state, data) {
        state.listTeachersByCourse = (Array.isArray(data) ? data : []).map(item => ({
			id: item.idTeacher,
            label: item.firstName + ' ' + item.lastName, 
            typeOperation: crudStatus.CREATED,
            isDictates: item.isDictates, 
            value: {
                lastname: item.lastName,
                name: item.firstName
            }
		})) 
    },
    setComboCareerByTeacher(state, data) {
        state.listComboCareerByTeacher = (Array.isArray(data) ? data : []).map(item => ({
                id: item.idCourse,
                labelAlternative: `${item.name} - ${item.code} - ${item.status == status.ACTIVE ? 'Activo' : 'Inactivo'}`,
                label: `${item.name} - ${item.code}`,
                value: {
                    idCourse: item.idCourse,
                    name:item.name,
                    code: item.code,
                    typeOperation: crudStatus.CREATED,
                    isDictates: item.isDictates,
                    status: item.status
                }
            })
        )
    },
    setListCareerByTeacher(state, data) { 
        state.listCareerByTeacher = (Array.isArray(data.courses) ? data.courses : []).map(item => ({
            id: item.idCourse,
            label: item.name,
            value: {
                idCourse: item.idCourse,
                name: item.name, 
                code: item.code,
                typeOperation: crudStatus.UPDATED,
                isDictates: item.isDictates
            }
        }))
    },
    setIdTeacher(state, data) {
        state.idTeacher = data
    }
}

export const actions = {
    async findTeachers({state, commit, rootState}, idCollege) {
        try {
            let response = await apiTeacherList(this.$axios, idCollege, state.term, state.page, state.limit, state.sortCode, state.sortName, state.sortEmail, state.sortStatus)
            commit('setTeachers', response)
        } catch( error) {
            commit('setTeachers', [])
        }
    },
    async getDetail({commit}, idTeacher) {
        try {
            let response = await apiTeacherDetail(this.$axios, idTeacher)
            commit('setDetail', response)
        } catch(error) {
            commit('setDetail', {})
        }
        
    },
    async create({}, data) {
        return await apiTeacherCreate(this.$axios, data)
    },
    async edit({}, { data, type }) {
        if(type == 1) return await apiTeacherUpdate(this.$axios, data)
        else return await apiTeacherUpdateCourses(this.$axios, data)
    },
    async findCoursesByTeacher({ commit }, { idCollege, idTeacher, term, isDictates }) {
        try {
            commit('setComboCareerByTeacher', await apiCourseDictadesOrDictated(this.$axios, idCollege, idTeacher, term, isDictates))
        } catch(error) {
            commit('setComboCareerByTeacher', []) 
        }
    },
    async getCoursesByTeacher({ commit }, { idTeacher, isDictates }) {
        try {
            commit('setListCareerByTeacher', await apiTeacherDetailCourses(this.$axios, idTeacher, isDictates))
        } catch(error) {
            commit('setListCareerByTeacher', [])
        }
    },
    async updateStatus({}, data) {
        await apiTeacherUpdateStatus(this.$axios, data)
    },
    async findTeachersByCourse({commit}, data) {
        try {
            let response = await apiFindTeacher(this.$axios, data.idCollege, data.idCourse, data.term)
            commit('setComboTeachersByCourse', response)
        } catch(error) {
            commit('setComboTeachersByCourse', [])
        }
    },
    async updateImageUrl({}, { idTeacher, url }) {
        await apiUpdateImageUrl(this.$axios, idTeacher, url)
    },

    async changeFileDirectory({}, { key, url }) {
        return await this.$axios.post('/api/s3/change-directory', { key, url } )
    },
    async saveTeachers({ state, commit }, data) {
        let res = await apiTeacherUploadFile(this.$axios, data);
        console.log('la data');
        console.log(res);
        //commit("setTeachers", res);
    }    
}