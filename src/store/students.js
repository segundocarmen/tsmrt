import { apiStudentList, apiStudentDetail, apiStudentUpdateStatus, apiStudentValidEmailCollege, apiStudentEmbassadorWabu, apiStudentFindForUpdate, apiStudentUpdate } from '~/api/student'
import { termStatus, sort } from '~/enums'

export const state = () => ({
    list: [],
    term: termStatus.NEGATIVE,
    limit: 10,
    sortDate: sort.ASC, 
    sortName: 0,
    sortEmail: 0,
    sortStatus: 0,
    sortValidate: 0,
    totalPage: 2,
    totalStudents: 12,
    page: 1,
    //detail
    limitDetail: 6,
    sortCourse: 1,
    sortCicle: 1,
    sortPeriod: 1,
    edit: {
        emailPersonal: 'andres.alonso.cabrera.li@gmail.com',
        emailCollege: 'andres.alonso@pucp.com.pe'
    },
    detail: {},
    limitDetail: 10,
    totalPageDetail: 2,
    totalStudentsDetail: 12,
    pageDetail: 1,
    dataForEdit: {}
})

export const mutations = {
    setList(state, data) {
        state.list = data.students
        state.totalPage = data.countPage
        state.totalStudents = data.countRecord
    },
    setPagination(state, data) {
        state.page = data
    },
    setTerm(state, term) {
        state.term = term
    },
    setSortList(state, { sortName, isAscending }) {
        state.sortDate = sortName == 'sortDate' ? isAscending : 0
        state.sortName = sortName == 'sortName' ? isAscending : 0
        state.sortEmail = sortName == 'sortEmail' ? isAscending : 0
        state.sortStatus = sortName == 'sortStatus' ? isAscending : 0
        state.sortValidate = sortName == 'sortValidate' ? isAscending : 0
    },
    setDetail(state, data) {
        state.detail = data
    },
    setDataForEdit(state, data) {
        state.dataForEdit = data
    }
}

export const actions = {
    async getList({ state, commit }, idCollege) {
        try {
            let response = await apiStudentList(this.$axios, idCollege, state.term, state.page, state.limit, state.sortDate, state.sortName, state.sortEmail, state.sortStatus, state.sortValidate)
            commit('setList', response)
        } catch(error) {
            commit('setList', [])
        }
    },

    async getDetail({commit}, idStudent) {
        try {
            let response = await apiStudentDetail(this.$axios, idStudent)
            commit('setDetail', response)
        } catch(error) {
            commit('setDetail', [])
        }
    },

    async updateStatus({}, data) {
        await apiStudentUpdateStatus(this.$axios, data)
    },

    async validateEmail({}, data) {
        await apiStudentValidEmailCollege(this.$axios, data)
    },

    async isEmbassadorWabu({}, data) {
        await apiStudentEmbassadorWabu(this.$axios, data)
    },

    async getDataForEdit({commit}, idStudent) {
        try {
            let response = await apiStudentFindForUpdate(this.$axios, idStudent)
            commit('setDataForEdit', response)
        } catch(error) {
            commit('setDataForEdit', [])
        }
    },

    async update({}, data) {
        await apiStudentUpdate(this.$axios, data)
    }
}