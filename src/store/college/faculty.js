import { apiFacultiesList, apiFacultiesUpdate } from '~/api/faculty'

export const state = () => ({
    faculties: []
})

export const mutations = {
    setFaculties(state, data) {
        state.faculties = data
    }
}

export const actions = {
    async findFacultiesForCollege({commit}, idCollege) {
        try {
            let response = await apiFacultiesList(this.$axios, idCollege)
            commit('setFaculties', response)
        } catch(error) {
            commit('setFaculties', [])
        }
    },
    async updateFaculties({}, data) {
        await apiFacultiesUpdate(this.$axios, data)
    }
}