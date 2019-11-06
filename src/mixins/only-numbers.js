export const onlyNumbersMixin = {
    methods: {
        onlyNumbers(evt) {
            evt = (evt) ? evt : window.event;
            let charCode = (evt.which) ? evt.which : evt.keyCode
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                evt.preventDefault()
            } else {
                return true
            }
        }
    }
}