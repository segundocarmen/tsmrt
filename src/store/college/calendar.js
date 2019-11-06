import { crudStatus } from '~/enums'
import { apiCalendarDetail, apiCalendarPeriodsList, apiCalendarEdit } from '~/api/calendar' 


export const state = () => ({
    detail: [],
    periodNameList: []
})

export const mutations = {
    setDetail(state, data) {
        state.detail = data.map(item => ({
            endString: item.endString,
            idPeriod: item.idPeriod,
            periodName: item.periodName,
            periodYear: item.periodYear,
            isIrregular: item.isIrregular,
            isAssociated: item.isAssociated,
            startString: item.startString,
            typeOperation: crudStatus.ORIGINAL,
            required: false
        }))
    },
    setPeriodNameList(state, data) {
        state.periodNameList = data
    }
}

export const actions = {
    async getPeriodNameList({ commit }, idCollege) {
        commit('setPeriodNameList', await apiCalendarPeriodsList(this.$axios, idCollege))
    },
    async getDetail({ commit }, idCollege ) {
        commit('setDetail', await apiCalendarDetail(this.$axios, idCollege))
    },
    async updateCalendar({}, { idCollege, periods }) {
        await apiCalendarEdit(this.$axios, idCollege, periods ) 
    }
}