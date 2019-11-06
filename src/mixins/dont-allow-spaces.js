export const dontAllowSpacesMixin = {
    methods: {
        dontAllowSpaces(evt) {
           evt = evt ? evt : window.event
           let charCode = evt.which ? evt.which : evt.keyCode 

           if(charCode == 32) evt.preventDefault()
        }
    }
}