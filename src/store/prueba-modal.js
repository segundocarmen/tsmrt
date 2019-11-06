import { eventBus } from '~/event-bus'

export const state = () => ({
    title: null, 
    message: null, 
    type: 'error' 
})

export const mutations = {
    setData(state, params) {
        const { title, message, type } = params || {}
        state.title = title
        state.message = message
        state.type = type || 'error'
    }
}

export const actions = {
    open({ commit }, params) {
        console.log('prueba modal')
        commit('setData', params)
        eventBus.$emit('alert')
    }
}