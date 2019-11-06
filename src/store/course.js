import {apiFindCourses, apiCourseDetail, apiCourseDetailTeacher, apiCourseCreate, apiCourseUpdate, apiCourseTest, apiFindCourseForCareerByTerm, apiCourseActiveInactive, apiCourceUploadFile} from '../api/course'
import { termStatus, sort } from '~/enums'

export const state = () => ({
    courses: [],
    detail: {},
    term: termStatus.NEGATIVE,
    page: 1,
    limit: 10,
    sortCode: 0,
    sortName: sort.ASC,
    sortStatus: 0,
    totalPage: null,
    totalCourses: null,
    pageDetail: 1,
    limitDetail: 6,
    sortFirstNameDetail: 1,
    sortStatusDetail: 1,
    listTeacherByDetail: [],
    totalPageDetail: null,
    totalTeachersDetail: null,
    listCourses: []
})

export const mutations = {
    setTerm(state, data) {
        state.term = data
    },
    setCourses(state, data) {
        state.totalCourses = data.countRecord
        state.totalPage = data.countPage
        state.courses = (Array.isArray(data.courses) ? data.courses : []).map(item => ({
            name: item.name,
            code : item.code,
            countCareer: item.countCareer,
            countTeacher: item.countTeacher,
            status: item.status == 1 ? true : false,
            _id: item._id
        }))
    },
    setPagination(state, currentPage) {
        state.page = currentPage
    },
    setDetail(state, data) {
        state.detail = data
    },
    setListTeacherByDetail(state, data) {
        state.totalPageDetail = data.countPage
        state.totalTeachersDetail = data.countRecord
        state.listTeacherByDetail = data.teachers
    },
    setListTeacher(state, data) {
        state.listTeacherByDetail = data.teachers
    },
    setListCourse(state, data) {
        state.listCourses = data.map(item => ({
            idCourse: item._id,
            name: item.name,
            code: item.code
        }))
    },
    setPaginationDetail(state, currentPage) {
        state.pageDetail = currentPage
    },
    setSort(state, { sortName, isAscending }) {
        state.sortCode = sortName == 'sortCode' ? isAscending : 0
        state.sortName = sortName == 'sortName' ? isAscending : 0
        state.sortStatus = sortName == 'sortStatus' ? isAscending : 0
    },
    setSortDetail(state, { sortName, isAscending }) {
        state.sortFirstNameDetail = sortName == 'sortFirstNameDetail' ? isAscending : 0
        state.sortStatusDetail = sortName == 'sortStatusDetail' ? isAscending : 0
    }
}


export const actions = {
    async findCourses({state, commit, rootState}, id) {
        try {
            let response = await apiFindCourses(this.$axios, id, state.term, state.page, state.limit, state.sortCode, state.sortName, state.sortStatus)
            commit('setCourses', response)
        } catch( error) {
            commit('setCourses', [])
        }
    },
    async getDetail({commit}, id) {
        try {
            let response = await apiCourseDetail(this.$axios, id)
            commit('setDetail', response)
            commit('setListTeacher', response)
        } catch(error) {
            commit('setDetail', [])
        }
        
    },

    async findDetailTeacher({state, commit}, idCourse) {
        try {
            let response = await apiCourseDetailTeacher(this.$axios, idCourse, state.pageDetail, state.limitDetail, state.sortFirstNameDetail, state.sortStatusDetail)
            commit('setListTeacherByDetail', response)
        } catch(error) {
            commit('setListTeacherByDetail', [])
        }
        
    },

    async create({}, { name, code , careers, idCollege, teachers }) {
        await apiCourseCreate(this.$axios, { name, code , careers, idCollege, teachers })
    },

    async update({}, data) {
        await apiCourseUpdate(this.$axios, data)
    },

    async test({}, id) {
        await apiCourseTest(this.$axios, id)
    },

    async findCourseForCareer({commit}, { idCollege, term }) {
        try {
            let response = await apiFindCourseForCareerByTerm(this.$axios, idCollege, term )
            commit('setListCourse', response)
        } catch (error) {
            commit('setListCourse', [])
        }
        
    },
    async activeInactiveCourse({ commit }, data) {
        await apiCourseActiveInactive(this.$axios, data)
    },    
    async saveCources({ state, commit }, data) {
        let res = await apiCourceUploadFile(this.$axios, data);
        console.log('la data');
        console.log(res);
        //commit("setCourses", res);
    }   
}