import { eventBus } from '~/event-bus'

export const state = () => ({
    title: null,
    message: null,
    redirect: null
})

export const mutations = {
    setData(state, params) {
        let { title, message, redirect } = params || {}
        state.title =  title
        state.message = message
        state.redirect = redirect
    },
    cleanData(state) {
        state.title =  null
        state.message = null
        state.redirect = null
    }
}

export const actions = {
    open({ commit }, params) {
        console.log('open alert-modal')
        commit('setData', params)
        eventBus.$emit('alertModal')
    }
}