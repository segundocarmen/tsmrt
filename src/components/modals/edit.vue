<template lang="pug">
    el-dialog.modalEdit__style(
        :visible.sync="dialogVisible"
        width="385px"
        class="general-dialog wabu-dialog"
        :show-close="false"
        top="0"
        bottom="0"
    )
        i(:class="icon")
        p(v-html="message")
        el-form-item.input__edit(:error="nameRulesLocation[0]" v-if="editLocation")
            el-input(
                placeholder="Nombre" 
                v-model.trim="inputTextLocation"
                @input="$v.inputTextLocation.$touch()"
                :maxlength="100"
            )
        el-form-item.input__edit(:error="nameRulesFaculties[0]" v-if="editFacultie")
            el-input(
                placeholder="Nombre" 
                v-model.trim="inputTextFacultie"
                @input="$v.inputTextFacultie.$touch()"
                :maxlength="100"
            )
        div(slot="footer" class="dialog-footer",  :class="{ 'disable' : isDisable || conditionalButton }")
            el-button(@click="closeModal"  :disabled="isDisable").wabu-btn.wabu-btn--transparent CANCELAR
            el-button(@click="save"  :disabled="isDisable || conditionalButton").dialog-save.wabu-btn.wabu-btn--white  ACEPTAR
</template>

<script>
    import { minLength } from 'vuelidate/lib/validators'
    import { withParams } from 'vuelidate/lib/validators/common'

    export default {
        props: ['isSameName', 'about'],
        data() {
            return {
                dialogVisible: false,
                message: '',
                icon: '',
                isDisable: false,
                inputTextLocation: '',
                inputTextFacultie: '',
                information: {},
                nameIsExist: false,
                conditionalButton: false,
                prevName: null,
                editLocation: false,
                editFacultie: false
            }
        },
        validations: {
            inputTextLocation: {
                minLength: minLength(3),
                lettersAndNumbers: withParams(
                    { type: 'lettersAndNumbers' },
                    value => !/[~.*+?^${}()!"·%/=/¿'´‚¨_,:ªº#¢@º¡`;çø|&]/.test(value)
                ),
            },
            inputTextFacultie: {
                minLength: minLength(3),
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^a-zA-ZÑñáéíóúÁÉÍÓÚ\s]/.test(value)
                ),
            }
        },
        methods: {
            open(message, val) {
                this.dialogVisible = true
                this.isDisable = false
                this.message = message
                //this.icon = icon
                this.inputTextLocation = this.inputTextFacultie = this.prevName = val.name
                this.information = val
                this.nameIsExist = false
            },
            closeModal() {
                this.dialogVisible = false
                this.isDisable = false
                setTimeout(() => {
                    this.message = ''
                    this.inputTextLocation = this.inputTextFacultie = ''
                    this.information = {}
                    this.nameIsExist = false
                }, 300)
            },
            save() {
                this.isDisable = true 
                setTimeout(() => {
                    this.dialogVisible = false
                    this.$emit('save', {
                        name: this.about == 'faculties' ? this.inputTextFacultie : this.inputTextLocation,
                        id: this.information.idLocation || this.information.idFaculty
                    })
                }, 2000)
            },
            watchByInput(val) {
                if(this.prevName == val) {
                    this.nameIsExist = false
                    this.conditionalButton = true
                } else {
                    if(val.length < 3) {
                        this.nameIsExist = false
                        this.conditionalButton = true
                    } else {
                        let nameExist = this.isSameName.filter(i => i.name == val)
                        this.nameIsExist = Boolean(nameExist.length)

                        this.conditionalButton =  Boolean(this.nameRulesLocation.length || this.nameRulesFaculties.length)
                    }
                    
                }
            }
        },
        computed: {
            nameRulesLocation() {
                const errors = []
                if (!this.$v.inputTextLocation.$dirty) return errors
                this.nameIsExist && errors.push('* Este nombre esta siendo utilizado'),
                !this.$v.inputTextLocation.minLength && errors.push('*Debes de ingresar mínimo 3 caracteres'),
                !this.$v.inputTextLocation.lettersAndNumbers && errors.push('*Debes ingresar sólo letras y números')
                return errors
            },
            nameRulesFaculties() {
                const errors = []
                if (!this.$v.inputTextFacultie.$dirty) return errors
                this.nameIsExist && errors.push('* Este nombre esta siendo utilizado'),
                !this.$v.inputTextFacultie.minLength && errors.push('*Debes de ingresar mínimo 3 caracteres'),
                !this.$v.inputTextFacultie.letters && errors.push('*Debes ingresar sólo letras')
                return errors
            }
        },
        watch: {
            inputTextLocation(val) {
                this.watchByInput(val)
            },
            inputTextFacultie(val) {
                this.watchByInput(val)
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.about == 'faculties' ?  this.editFacultie = true : this.editLocation = true
            })
        },
    }
</script>

<style lang="sass">
    .modalEdit__style
        .input__edit
            padding: 10px 5px 0
            margin: 12px 12px 0
        .el-form-item__error
            color: #FFF
            right: 0
            left: unset
            margin-top: 8px
            line-height: 18px
            font-size: 10px
            font-weight: 500
        .el-form-item.is-error
            .el-input__inner
                border-color: #FFF !important
        .el-dialog__body
            padding: 29px !important
</style>
