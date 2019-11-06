<template lang="pug">
    div.error_500
        img( width=100  src="~assets/images/logo/logo-wabu-blue.png")
        h2 500
        p  Lo sentimos algo salió mal
        el-button.button_error( @click="back") REGRESAR
        .powered-styles
            span Powered by
            img(src="~assets/images/logo/logo-tismart-blue.png"  height=23 )
</template>

<script>
export default {
    methods: {
        back() {
            this.$router.back()
        }
    } 
}
</script>
<style lang="sass">
    .error_500
        display: flex
        justify-content: center
        align-items: center
        flex-direction: column
        min-height: 100vh
        > img
                margin-bottom: 60px
        h2
            font-size: 159px
            color: #1283FF
            letter-spacing: 10px
            line-height: 183px
            text-align: center
        p  
            font-size: 24px
            color: #1283FF
            line-height: 27px
            margin-top: 30px
            letter-spacing: 0.48px
        .button_error
            background: linear-gradient(90deg, #1580F2 0%, #476EF7 100%)
            border-radius: 50px
            margin-top: 45px
            span
                color: #fff !important
        .powered-styles
            margin-top: 80px
            display: flex
            align-items: center
            font-size: 12px
            color: #1283FF
            margin-rigth: 5px !important
            img
                margin-left: 10px
            span
                display: inline-block
                color: #1283FF

</style>


