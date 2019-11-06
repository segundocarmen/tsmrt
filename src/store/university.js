import { 
    apiCollegeCreate,
    apiCollegeDetail,
    apiCollegeList,
    apiCollageTimeZone,
    apiCollegeUpdate,
    apiCollegeUpdateStatus,
    apiCollageDetailForEdit
} from '../api/college'

import { apiSuggestUniversity } from '../api/suggest'
import { termStatus } from '~/enums'

export const state = () => ({
    term: -1,
    page: 1,
    limit: 6,
    totalPage: null,
    itemsPerPage: 10,
    totalCollege: null,
    detail: {},
    search: {},
    list: [],
    suggestedUniversityList: [],
    timeZoneList: [],
    detailUniversity: {}
})

export const mutations = {
    setList(state, data) {
        state.totalPage = data.countPage
        state.totalCollege = data.countRecord
        state.list = data.college.map(({ _id, domain, status, name, nickName, countFacultie, countLocation, countStundent }) => ({
            _id,
            domain,
            status,
            name,
            nickName,
            countFacultie:  countFacultie ? countFacultie : 0,
            countLocation: countLocation ? countLocation: 0,
            countStundent: countStundent ? countStundent : 0
        }))
    },
    setDetail(state, data) {
        if(!Object.keys(data).length)
            state.detail = {}
        else {
            state.detail = (Array.isArray(data) ? data : [data]).map(item => ({
                id: item.idCollege,
                calendaries: item.calendaries ? item.calendaries : [],
                faculties: item.faculties ? item.faculties : [],
                locations: item.locations ? item.locations : [],
                name: item.name,
                nickName: item.nickName,
                status: item.status ? item.status : false,
                countStudents: item.countStundent,
                countTeacher: item.countTeacher,
                countRequest: item.countRequest,
                countCareer: item.countCareer,
                countSpam: item.countSpam,
                countCourse: item.countCourse,
                countDocument: item.countDocument,
                qualifyDay: item.daysBeforePeriodEnd ? item.daysBeforePeriodEnd : 0,
                notificationDay: item.daysBeforePeriodStart ? item.daysBeforePeriodStart : 0
            }))[0]
        }
    },
    setUniversityList( state, data ) {
        // let array = data.filter(item => item.nickName !== "UPCH")
        state.suggestedUniversityList = data.map(item => ({
            name: item.name,
            value: item.nickName
        }))
    },
    setTimeZoneList( state, data ) {
        state.timeZoneList = data.map(item => ({
            name: item.name,
            value: item
        }))
    },
    setTerm(state, term) {
        state.term = term
    },
    setPaginationCollege(state, currentPage) {
        state.page = currentPage
    },
    setDetailForEdit(state, data) {
        state.detailUniversity = data
    }
}

export const actions = {
    async getList({ state, commit }, id) {        
        let term = state.term ? state.term : termStatus.NEGATIVE
        let response = await apiCollegeList(this.$axios, id, term, state.page, state.limit)
        commit('setList', response)
    },
    async getDetail({ state, commit }, id) {
        commit('setDetail', await apiCollegeDetail(this.$axios, id))
    },
    async create({}, header) {
        await apiCollegeCreate(this.$axios, header)
    },
    async edit({}, data) {
        await apiCollegeUpdate(this.$axios, data)
    },
    async getSuggestedUniversity({ commit }, data) {
        commit('setUniversityList', await apiSuggestUniversity(this.$axios, data.id, data.term))
    },
    async getTimeZoneList({ commit }, id) {
        commit('setTimeZoneList', await apiCollageTimeZone(this.$axios, id))
    },
    async updatedStatus({}, data) {
        await apiCollegeUpdateStatus(this.$axios, data.idCollege, data.status)
    },

    async getDetailForEdit({ commit }, id) {
        try {
            let response = await apiCollageDetailForEdit(this.$axios, id)
            commit('setDetailForEdit', response)
        } catch(error) {
            commit('setDetailForEdit', {})
        }
       
    }
}