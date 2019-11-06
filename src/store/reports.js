import { sort } from '~/enums' 

export const state = () => ({
    list: [
        { id:'19h3', name: 'Arquitectura' },
        { id:'wjxowee', name: 'Arte y moda'},
        { id:'2432rdas', name: 'Ciencia Política' },
        { id:'sfsds', name: 'Contabilidad' },
        { id:'3534t', name: 'Danza' }
    ],
    limit: 10,
    totalPage: 2,
    totalRequest: 12,
    page: 1,
    sortName: sort.ASC,
    sortCountVote: 0
})

export const mutations = {
    setList(state, data) {
        state.list = data.colleges,
        state.totalRequest = data.countRecord
        state.totalPage = data.countPage
    },
    setPagination(state, page) {
        state.page = page
    },
    
    setSortList(state, { name, isAscending }) {
        state.sortName = 'sortName' == name ? isAscending : 0
        state.sortCountVote = 'sortCountVote' == name ? isAscending : 0
    }
}

export const actions = {
    async getList({commit, state}, id) {
        try {
            let response = []
            commit('setList', response)
        } catch(error) {
            commit('setList', [])
        }
        
    }
}