<template lang="pug">
    no-ssr
        sweet-modal(:icon="type" ref="sweetModal" hide-close-button @close="cleanData()")
            p {{ title }}
            p {{ message }}
            v-layout(justify-center)
                v-btn(@click="_close").primary-button.blue Aceptar
</template>
<script>
    import sweetModal from '~/mixins/sweet-modal'
    import { mapMutations, mapState } from 'vuex'

    export default {
        mixins: [sweetModal],
        computed: mapState({
            title: state => state['prueba-modal'].title,
            message: state => state['prueba-modal'].message,
            type: state => state['prueba-modal'].type
        }),
        methods: mapMutations({
            cleanData: 'prueba-modal/setData'
        })
    }
</script>
