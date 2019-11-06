<template lang="pug">
    el-form-item.periodName__style(:error="nameRules[0]" :key="keyId") 
        el-row(type="flex")
            div
                span.label__style Nombre del Periodo
                el-input(v-model.trim="form.name" :placeholder="name" @input="$v.form.name.$touch()" type="text" maxLength="15")
            el-checkbox.checkbox__period(v-model="form.checked") Irregular
</template>

<script>
    import { required, minLength } from 'vuelidate/lib/validators'
    import { crudStatus } from '~/enums'

    export default {
        props: ['keyId', 'keyName', 'total', 'periods'],
        validations: {
            form: {
                name: {
                    required,
                    minLength: minLength(2),
                },
            }
        },
        data() {
            let name = this.periods[this.keyId]? this.periods[this.keyId].name : ''
            let checked = this.periods[this.keyId] ? this.periods[this.keyId].isIrregular : ''

            return {
                form: {
                    name: name,
                    checked: checked,
                },
                name: `Periodo ${this.keyId +1}`,
                nameIsRequired: true,
                totalItems: this.total,
                nameIsExist: null,
                id: '',
                prevName: '',
                prevChecked: ''
            }
        },
        computed: {
            nameRules() {
                const errors = []
                if (!this.$v.form.name.$dirty) return errors
                !this.$v.form.name.required && errors.push('*Debes ingresar un Nombre'),
                !this.$v.form.name.minLength && errors.push('*Debes de ingresar mínimo 2 caracteres'),
                this.nameIsExist && errors.push('*Ese nombre ya existe')
                return errors
            },
            conditionalTypeOperation() {
                if(this.id) {
                    return this.form.name == this.prevName && this.form.checked == this.prevChecked ? crudStatus.ORIGINAL : crudStatus.UPDATED
                } else {
                    return  crudStatus.CREATED
                }
            }
        },
        watch: {
            'form.name'(val) {
                this.form.name.trim().replace(/\s+/g, ' ')
                if(this.form.name.trim().length >= 2) {
                    this.nameIsRequired = false
                } else {
                    this.nameIsRequired = true
                }
                this.update()
            },
            'form.checked'(val) {
                this.$emit('updatePeriod', { name: this.form.name, isIrregular: this.form.checked, position: this.keyId, required: this.nameIsRequired, idNamePeriod: this.id, typeOperation : this.conditionalTypeOperation })
            },
            total(val) {
                this.clean()
            },
            periods(val) {
                this.setData()
            }
        },
        methods: {
            clean() {
                // this.form.name = ''
                // this.form.checked = false
                this.$v.$reset()
            },
            update() {
                let nameExist = this.periods.filter(i => i.name == this.form.name)
                this.nameIsExist = Boolean(nameExist.length)
                let conditional = this.nameRules.length >= 1 || this.form.name == '' ? true : this.nameIsRequired
                this.$emit('updatePeriod', { name: this.form.name, isIrregular: this.form.checked, position: this.keyId, required: conditional, idNamePeriod: this.id, typeOperation : this.conditionalTypeOperation })
            },
            setData(){
                this.form.name = this.periods[this.keyId].name
                this.prevName = this.periods[this.keyId].name
                this.form.checked = this.prevChecked = this.periods[this.keyId].isIrregular
                this.id = this.periods[this.keyId].idNamePeriod
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.setData()
                this.update()
            })
        }
    }
</script>

<style lang="sass">
    .periodName__style
        margin-left: 160px !important
        input
            width: 190.53px !important
        .label__style
            line-height: 14px
        .el-checkbox
            transform: translateY(25%)
            margin-left: 20px
            &:span
                font-size: inherit
                line-height: 16.5px
            .el-checkbox__inner
                border-color: #CED3D5 !important
                &:before
                    border: none
                &:after
                    left: 2.3px !important
                    top: -2px
</style>