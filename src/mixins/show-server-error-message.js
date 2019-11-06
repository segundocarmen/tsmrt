export default {
    mounted() {
        this.$nextTick(function () {
            if (this.$store.state.serverErrorMessage)
                setTimeout(() => {
                    this.$alert('Error en el servidor', this.$store.state.serverErrorMessage, 'error')
                }, 500)
        }) 
    }
}