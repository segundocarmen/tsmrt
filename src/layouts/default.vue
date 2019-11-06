<template lang="pug">
    div#app
        nuxt
        alert-modal(ref="alertModal")
</template>

<script>
import AlertModal from '~/components/modals/alert'
import { eventBus } from '~/event-bus'

export default {
    components: {
        AlertModal
    },
    mounted() {
        this.$nextTick(function () {
            eventBus.$on('alertModal', () => this.$refs.alertModal.open())
        })
    },
    destroyed() {
        eventBus.$off('alertModal')
    }
}
</script>

<style lang="sass" scoped>
    .el-container 
        background: $main-color
        background: url('../assets/images/background/img_fondo.png')
        height: 100vh 
        display: flex
        justify-content: center
        align-items: center
        @include background-rules
</style>
