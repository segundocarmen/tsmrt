import { eventBus } from '~/event-bus'

export const state = () => ({
    icon: null,
    message: null,
    redirect: null
})

export const mutations = {
    setData(state, params) {
        let { icon, message, redirect } = params || {}
        state.icon =  icon
        state.message = message
        state.redirect = redirect
    },
    cleanData(state) {
        state.icon =  null
        state.message = null
        state.redirect = null
    }
}

export const actions = {
    open({ commit }, params) {
        commit('setData', params)
        eventBus.$emit('confirm')
    }
}