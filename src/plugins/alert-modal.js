export default ({ store }, inject) => {
    inject('alertModal', (title, message, redirect) => {
        store.dispatch('alert-modal/open', { title, message, redirect })
    }),
    
    inject('pruebaModal', (title, message, type) => {
        store.dispatch('prueba-modal/open', { title, message, type })
    }),

    inject('generalModal', (icon, message) => {
        store.dispatch('general-modal/open', { icon, message })
    })
}