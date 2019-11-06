import { apiCountryList, apiCountryForAdmin, apiCountryCreate, apiCountryUpdate, apiCountryDelete, apiFindCollegesForCountry, apiCountryDetail } from '../api/country'
import { roles, termStatus } from '~/enums'


export const state = () => ({
    countries: {},
    country: '',
    page: 1,
    limit: 6,
    totalCountries: '',
    totalPage: null,
    term: 'a',
    limitCollege: 6,
    colleges: [],
    totalPageCollege: null,
    totalCollege: null,
    pageCollege: 1 
})


export const mutations = {
    setCountries( state , data) {
        state.countries = data
        state.totalPage = data.countPage
    },
    setCountry(state, data) {
        state.country = data
    },

    setPagination(state, currentPage) {
        state.page = currentPage
    },
    setColleges(state, data) {
        state.totalPageCollege = data.countPage
        state.totalCollege = data.countRecord
        if(data.country)
            state.colleges = data.country[0].colleges
    },
    setPaginationCollege(state, currentPage) {
        state.pageCollege = currentPage
    },
    setTerm(state, term) {
        state.term = term
    }
}


export const actions = {
    async getDetail( { state, commit }, id) {
        commit('setCountry', await apiCountryDetail(this.$axios, id))
    },
    async getListAdmin({commit, state, rootState}) {
        //let conditionalCountriesByRole = rootState.account.user.user.rol == roles.ADMIN_GLOBAL ? [] : rootState.account.user.user.countries
        try {
            let response = await apiCountryForAdmin(this.$axios,  {
                //countries: conditionalCountriesByRole || [],
                countries: [],
                role: rootState.account.user.user.rol || 1,
                skip: state.page,
                limit: state.limit
            })
            commit('setCountries', response)
        } catch(error) {
            commit('setCountries', [])
        }
        
    },
    setCountry({ commit }, data) {
        commit('setCountry', data)        
    }
}