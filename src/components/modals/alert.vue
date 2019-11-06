<template lang="pug">
    el-dialog(
        :visible.sync="dialogVisible"
        width="390px"
        class="general-dialog wabu-dialog wabu-dialog--alert"
        top="0"
        bottom="0"
    )
        i.icon-ic-spam
        h2 {{ title }}
        p {{ message }}
            
</template>

<script>
import { mapState } from 'vuex'

export default {
    data() {
        return {
            dialogVisible: false,
            icon: '',
            isDisable: false
        }
    },
    computed: {
        ...mapState({
            title: state => state['alert-modal'].title,
            message: state => state['alert-modal'].message,
            redirect: state => state['alert-modal'].redirect
        })
    },
    methods: {
        open(message, icon) {
            console.log('open alert')
            this.dialogVisible = true
        },
        close() {
            this.dialogVisible = false
            if(this.redirect) this.$router.push(this.redirect)
            this.cleanData()
        },
        save() {
            setTimeout(() => {
                this.isDisable = true
                this.dialogVisible = false
                this.$emit('save')
            }, 2000);
        }
    }
}
</script>

<style lang="sass">
    .wabu-dialog--alert
        text-align: center
        .el-dialog 
            .el-dialog__body 
                padding-bottom: 70px
                h2 
                    color: #ffffff
                    margin-bottom: 20px
                    margin-top: 10px
                i
                    font-size: 50px
                p 
                    word-break: break-word
</style>


