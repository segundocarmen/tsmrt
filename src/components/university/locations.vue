<template lang="pug">
    .card__list-container
        .card__list-style
            div
                h3.subtitle__blue-general Sedes
            ul.autocomplete_list.locations__list
                li.blue__item-list( v-for="(location, index ) in locations" v-if="location.typeOperation !== 3") 
                    p.blue__item-lastname {{ location.name }}
                    div
                        i.icon-ic-edit-normal(v-if="location.isAssociated" v-on:click="editHeadquarter(location)")
                        i.icon-ic-cross-normal(v-if="!location.isAssociated" v-on:click="deleteHeadquarters(index)")
                el-form-item.select__item-list__locations(:error="headquarterInputErrorMessages[0]")
                    el-input(
                        placeholder="Agregar sede" 
                        v-model.trim="headquarterInput" 
                        @keypress.native="lettersAndNumbers"
                        @keypress.native.enter="addHeadquarters(headquarterInput)"
                        @input="$v.headquarterInput.$touch()"
                        :error="headquarterInputErrorMessages[0]"
                        :maxlength="100"
                        )
        modalEdit(ref="modalConfirm" @save="save" :isSameName="locations" :about="type")
</template>

<script>
    import { lettersAndNumbersMixin } from '~/mixins'
    import { minLength } from 'vuelidate/lib/validators'
    import { withParams } from 'vuelidate/lib/validators/common'
    import modalEdit from '~/components/modals/edit'
    import { crudStatus } from '~/enums'

    export default {
        props: [ 'locations'],
        mixins: [lettersAndNumbersMixin],
        components: {
            modalEdit
        },
        data() {
            return {
                headquarterInput: '',
                headquarterExist: false,
                type: 'locations'
            }
        },
        validations:{
            headquarterInput: {
                minLength: minLength(3),
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^0-9-a-zA-ZÑñáéíóúäëïöüâêîôûàèìòùÀÈÌÒÙÂÊÎÔÛÁÉÍÓÚÄËÏÖÜ\s]/.test(value)
                ),
            },
        },
        computed: {
            headquarterInputErrorMessages() {
                return [
                        !this.$v.headquarterInput.$dirty || this.$v.headquarterInput.minLength || '*Debes de ingresar mínimo 3 caracteres',
                        !this.$v.headquarterInput.$dirty || this.$v.headquarterInput.letters || '*Debes ingresar sólo letras y números',
                        !this.$v.headquarterInput.$dirty || !this.headquarterExist || '*La sede ya existe'
                    ].filter( val => typeof(val) == 'string')
            },
            dataLocation() {
                return this.locations
            }
        },
        methods: {
            deleteHeadquarters(val){
                this.$emit('deleteHeadquarters', val)
            },
            addHeadquarters(val){
                this.index
                if(val.length >= 3 && this.headquarterInputErrorMessages.length == 0) {
                    this.$emit('addHeadquarters', val)
                    this.headquarterInput = ""
                }
            },
            editHeadquarter(val) {
                this.$refs.modalConfirm.open('Este cambio se vera reflejado en todos los campos que contengan el nombre de esta Sede. ', val)
            },
            save(val) {
                for(let i = 0; i < this.locations.length; i++) {
                    if(this.locations[i].idLocation == val.id) {
                        this.locations[i].name = val.name
                        this.locations[i].typeOperation = crudStatus.UPDATED
                    }
                }
            }
        },
        watch: {
            headquarterInput(val) {
                let listFilter = this.locations.filter(i => i.typeOperation !== crudStatus.DELETED)
                let exist = listFilter.filter(item => item.name == val)
                this.headquarterExist = Boolean(exist.length)
            }
        }
    }
    
</script>

<style lang="sass">
    .autocomplete_list.locations__list
        padding: 10px 20px 40px!important
        .blue__item-list
            min-height: 24px !important
            width: 151.51px
        .blue__item-lastname
            padding-right: 20px
    .select__item-list__locations
        width: 147px !important
        margin-bottom: -1px !important
    .locations__list
        .el-input__inner
            line-height: 0px
    input
        &::-webkit-input-placeholder
            position: relative
            top: 4px

    .select__item-list__locations
        .el-input__inner
            font-size: 10px;
            color: #909399;
            line-height: 14px;
            font-weight: 400;
            vertical-align: top;
            margin-top: 3px;
    // *--- chrome ---*//
    @media all and (-webkit-min-device-pixel-ratio:0) and (min-resolution: .001dpcm)
        input
            &::-webkit-input-placeholder
                position: relative
                top: 0px
</style>