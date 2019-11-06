import { apiLocationsList, apiLocationsUpdate } from '~/api/location'

export const state = () => ({
    locations: []
})

export const mutations = {
    setLocations(state, data) {
        state.locations = data
    }
}

export const actions = {
    async findLocationsForCollege({commit}, idCollege) {
        try {
            let response = await apiLocationsList(this.$axios, idCollege)
            commit('setLocations', response)
        } catch(error) {
            commit('setLocations', [])
        }
    },
    async updateLocations({}, data) {
        await apiLocationsUpdate(this.$axios, data)
    }
}