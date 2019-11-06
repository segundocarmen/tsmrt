export const lettersAndNumbersSearchMixin = {
    methods: {
        lettersAndNumbersSearch(evt) {
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode > 31 && (charCode < 65 || charCode > 90) &&
                (charCode < 97 || charCode > 122) &&
                (charCode < 48 || charCode > 57) && 
                charCode !== 241 &&
                charCode !== 209 &&
                charCode !== 32 &&
                charCode !== 64 &&
                charCode !== 46  ) {
                evt.preventDefault();
            } else {
                return true;
            }
        }
    }
}