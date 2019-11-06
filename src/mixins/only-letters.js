export const onlyLettersMixin = {
    methods: {
        onlyLetters(evt) {
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode < 65 || charCode > 90) &&
                (charCode < 97 || charCode > 122) &&
                charCode !== 241 &&
                charCode !== 209 &&
                charCode !== 32  ) {
                evt.preventDefault();
            } else {
                return true;
            }
        }
    }
}