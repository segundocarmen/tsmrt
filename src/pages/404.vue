<template lang="pug">
    div.error_404
        img(src="~assets/images/logo/logo-wabu-white.png")
        h2 404
        p Lo sentimos, algo salió mal. #[br] No encontramos la página a la quieres dirigirte
        el-button.button_error( @click="back") REGRESAR
        .powered-styles
            span Powered by
            img(src="~assets/images/logo/logo-tismart.png"  height=23 )
</template>
<script>
export default {
    asyncData({ redirect }) {
        // redirect('/')
    },
    methods: {
        back() {
            console.log('back')
            this.$router.back()
        }
    }
}
</script>
