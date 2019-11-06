import { apiRegisterEnrollmentListHistoryAcademic } from '~/api/register-enrollment'
import { sort } from '~/enums'

export const state = () => ({
    listHistoryAcademic: [],
    page: 1,
    limit: 6,
    sortCourse: sort.ASC,
    sortCicle: 0,
    sortPeriod: 0,
    totalHistoryAcademic: null,
    totalPage: null
})

export const mutations = {
    setList(state, data) {
        state.totalHistoryAcademic = data.countRecord
        state.totalPage = data.countPage
        state.listHistoryAcademic = data.academicHistory
    },
    setPagination(state, page) {
        state.page = page
    },
    setSortDetail(state, { sortName, isAscending } ) {
        state.sortCourse = sortName == 'sortCourse' ? isAscending : 0
        state.sortCicle = sortName == 'sortCicle' ? isAscending : 0
        state.sortPeriod = sortName == 'sortPeriod' ? isAscending : 0
    }
}

export const actions = {
    async getListHistory({ state, commit }, idCollege) {
        try {
            let response = await apiRegisterEnrollmentListHistoryAcademic(this.$axios, idCollege, state.page, state.limit, state.sortCourse, state.sortCicle, state.sortPeriod)
            commit('setList', response)
        } catch (error) {
            commit('setList', [])
        }
    }
}