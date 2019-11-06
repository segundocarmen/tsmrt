<template lang="pug">
    .card__list-style
        div
            h3.subtitle__blue-general Facultades
        
        ul.autocomplete_list()
            li.blue__item-list.faculties(v-for="(faculty , index) in  faculties" v-bind:class=" {'hidden':  faculty.typeOperation == 3} ")
                p.blue__item-lastname {{ faculty.name }}
                i.icon-ic-edit-normal(v-if="faculty.isAssociated" v-on:click="editFaculty(faculty)")
                i.icon-ic-cross-normal(v-if="!faculty.isAssociated" v-on:click="deleteFaculty(index)")
            el-form-item.select__item-list(:error="facultyInputErrorMessages[0]")
                el-input(
                        placeholder="Agregar facultad",
                        v-model.trim="facultyInput",
                        @keypress.native="lettersAndNumbers"
                        @keypress.native.enter="addFaculties(facultyInput)"
                        @input="$v.facultyInput.$touch()"
                        :error="facultyInputErrorMessages[0]"
                        :maxlength="100"
                )
        modalEdit(ref="modalConfirm" @save="save" :isSameName="faculties" :about="type")
</template>

<script>
    import { lettersAndNumbersMixin } from '~/mixins'
    import { minLength } from 'vuelidate/lib/validators'
    import { withParams } from 'vuelidate/lib/validators/common'
    import modalEdit from '~/components/modals/edit'
    import { crudStatus } from '~/enums'

    export default {
        props: [ 'faculties'],
        mixins: [lettersAndNumbersMixin],
        components: {
            modalEdit
        },
        data() {
            return {
                facultyInput: '',
                facultyExist: false,
                type: 'faculties'
            }
        },
        validations: {
            facultyInput: {
                minLength: minLength(3),
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^0-9-a-zA-ZÑñáéíóúäëïöüâêîôûàèìòùÀÈÌÒÙÂÊÎÔÛÁÉÍÓÚÄËÏÖÜ\s]/.test(value)
                ),
            },
        },
        computed: {
            facultyInputErrorMessages() {
                return [
                        !this.$v.facultyInput.$dirty || this.$v.facultyInput.minLength || '*Debes de ingresar mínimo 3 caracteres',
                        !this.$v.facultyInput.$dirty || !this.facultyExist || '*La facultad ya existe',
                        !this.$v.facultyInput.$dirty || this.$v.facultyInput.letters || "*Debes ingresar sólo letras o números"
                    ].filter( val => typeof(val) == 'string')
            },
        },
        methods: {
            addFaculties(val) {
                if(val.length >= 3 && this.facultyInputErrorMessages.length == 0) {
                    this.$emit('addFaculties', val)
                    this.facultyInput = ""
                }
                
            },
            deleteFaculty(val){
                this.$emit('deleteFaculty', val)
            },
            editFaculty(val) {
                this.$refs.modalConfirm.open('Este cambio se vera reflejado en todos los campos que contengan el nombre de esta Facultad. ', val)
            },
            save(val) {
                for(let i = 0; i < this.faculties.length; i++) {
                    if(this.faculties[i].idFaculty == val.id) {
                        this.faculties[i].name = val.name
                        this.faculties[i].typeOperation = crudStatus.UPDATED
                    }
                }
            }
        },
        watch: {
            facultyInput(val) {
                let listFilter = this.faculties.filter(item => item.typeOperation !== crudStatus.DELETED)
                let exist = listFilter.filter(item => item.name == val)
                this.facultyExist = Boolean(exist.length)
            }
        }
    }
</script>

<style lang="sass">
    .autocomplete_list
        padding: 15px 20px !important
        flex-wrap: wrap
        .faculties
            width: 218.5px !important
            margin-bottom: 10px !important
            .blue__item-lastname
                font-size: 12px
                letter-spacing: 0.24px
                line-height: 15px
                font-weight: 100 !important
               
    .select__item-list
        width: 216.72px !important
        height: 43.04px
        margin-bottom: 0
        input
            // border: 0.5px solid #1283FF !important
            // border-radius: 6px
            min-height: 43.04px
        .el-input__inner
            font-size: 10px
            color: #909399
            line-height: 10px
            font-weight: 400
    .hidden
        display: none
</style>