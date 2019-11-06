export default ({ store }, inject) => {
    inject('catchError', error =>  store.dispatch('catchError', error))
}