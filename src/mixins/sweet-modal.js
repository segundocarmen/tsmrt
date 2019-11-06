import { SweetModal } from 'sweet-modal-vue'

export default {        
    components: { 
        SweetModal 
    },
    methods: {
        open() {
            this.$refs.sweetModal.open()
        },
        _close() {
            this.$refs.sweetModal.close()
        }        
    }
}