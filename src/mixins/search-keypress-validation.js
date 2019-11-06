import { lettersAndNumbersSearchMixin } from '~/mixins'

export const searchKeypressValidation = {
    mixins: [lettersAndNumbersSearchMixin],
    methods: {
        searchKeypressValidation() {
            document.querySelector('.search__input-box input').addEventListener('keypress', e => {
                this.lettersAndNumbersSearch(e)
            })
            document.querySelector('.search__input-box input').addEventListener('keyup', e => {
                this.lettersAndNumbersSearch(e)
            })
        }
    }
}