<template lang="pug">
    footer.footer-style
        p.footer__error-message(v-html='errorMessage')
        el-button(plain round @click="$emit('cancel')").wabu-btn--edit.wabu-btn--cancel CANCELAR
        el-button(type="primary" round :disabled="disabled" @click="$emit('save')").wabu-btn--edit.wabu-btn--save GUARDAR
</template>
<script>
export default {
    props: [ 'disabled', 'errorMessage' ]
}
</script>

<style lang="sass" scoped>
    footer
        button
            margin-left: 15px !important
            @include transition(0.2s)
            &.is-disabled 
                opacity: 0.5
    .footer__error-message 
        font-size: 12px
        color: #FF7C7C
        font-family: $default-font
        text-align: right
        line-height: 18px
        margin-right: 5px
</style>

