<template lang="pug">
    div
        div.new-university
            h1.title.title-back
                i.icon-back.icon-ic-back-normal(@click="back")
                | {{ title }}
            el-form(label-width="160px")
                el-form-item(label="Nombre" :error="nameRules" ).name-item
                    el-select(v-model="form.name" 
                        @input="$v.form.name.$touch()" 
                        filterable
                        remote=''
                        @keypress.native="nameFilter"
                        :disabled="isEdit"
                        @change="selectUniversity"
                        placeholder=''
                        :loading="loading"
                        :clearable="true"
                        :remote-method='remoteMethod'
                        value-key="name"
                        reserve-keyword
                        no-match-text="No se encontraron coincidencias"
                        no-data-text=""
                    )
                        el-option.class(v-for="(item, i) in universityOptions" :key="i" :label="item.name" :value="item") 
                el-form-item(label="Abreviatura")
                    el-input.is-disabled--input(v-model="form.abbreviation" maxLength="8" disabled).input-abbrev
                    //span.input__rule *Máx. 8 caracteres

                el-form-item(label="Estructura del correo").email-structure-item
                    el-input(v-model="form.emailStructure")
                    el-tooltip(class="item" effect="dark" placement="right-start" popper-class="popper-domain")
                        i.icon-ic-info
                        div.tooltip-content(slot="content" v-html="infoContent") 
                        

                el-form-item(label="Dominio del correo" :error="domainRules[0]")
                    el-input(v-model="form.domain" @input="$v.form.domain.$touch()" placeholder="@universidad.com").input-domain

                el-form-item(label="Ejemplo de correo")
                    el-input(v-model="form.emailExample") 

                el-form-item(label="Zona Horaria", :error="timeZoneRules")
                    el-select(v-model="form.timeZone" @input="$v.form.timeZone.$touch()" placeholder="Seleccione").select__caret-style
                        el-option(v-for="(item, i) in timeZoneOptions" :key="i" :label="item.name" :value="item")
                
                el-form-item(label="Periodos al año", :error="periodRules").period-structure-item
                    el-select(v-model="form.period" @input="$v.form.period.$touch()" placeholder="Seleccione" @change="selectPeriod").select__caret-style
                        el-option(v-for="(item, i) in periods" :key="i" :label="item.name" :value="item.position" :disabled="optionsDisabled[i]")
                    el-tooltip(class="item" effect="dark" :content="infoPeriod" placement="right-start" popper-class="popper-domain")
                        i.icon-ic-info
                namePeriod(v-for="(item, i) in counter" ref="namePeriod" :key="i" @updatePeriod="periodSaveInfo" :keyId="i" :keyName="periodsData[i]" :total="counter" :periods="periodsData")

                div.notifications-configuration.mt-60.ml-35
                    h3.subtitle__blue-general Configuración de Notificaciones
                    div.notifications-configuration__box.mb-35.mt-30
                        p.smoothing-antialiased Notificar antes del incio del ciclo
                        div
                            span.smoothing-antialiased.mr-12 Días
                            el-input-number(v-model="notification" @change="notificationChange" :min="0" :max="30")
                    div.notifications-configuration__box
                        p.smoothing-antialiased Calificar antes del fin del ciclo
                        div 
                            span.smoothing-antialiased.mr-12 Días
                            el-input-number(v-model="qualification" @change="qualificationChange" :min="0" :max="30")


        footerEdit(@cancel="cancel" @save="submit" :disabled="btnDisabled" :errorMessage="message")
        confirmModal(ref="confirmModal" @save="action")
</template>
<script>
import footerEdit from '~/components/shared/footer-edit'
import namePeriod from '~/components/university/name-period'
import confirmModal from '~/components/modals/general'
import { required, maxLength } from 'vuelidate/lib/validators' 
import { withParams } from 'vuelidate/lib/validators/common'
import { mapState } from 'vuex';
import { InternalServerError, GatewayTimeoutError } from '~/errors'
import { eventBus } from '~/event-bus'
import { crudStatus } from '~/enums'

export default {
    layout: 'country',
    components: {
        footerEdit,
        namePeriod,
        confirmModal
    },
    head() {
        return {
            title: this.title
        }
    },
    async fetch({ store, params, query }){
        try {
            await store.dispatch('university/getTimeZoneList', params.country)
            if(query.type == 'edit') {
                await store.dispatch('university/getDetailForEdit', query.id)
            }
        } catch(error) {
            store.dispatch('catchError', error)
        }
    },
    data() {
        return {
            form: {
                name: '',
                abbreviation: '',
                emailStructure: '',
                domain: '',
                emailExample: '',
                timeZone: '',
                period: ''
            },
            infoContent: `Para completar el campo, utilizar una Expresión Regular. Para más información dale click <a target="_blank" href="https://es.wikipedia.org/wiki/Expresi%C3%B3n_regular"> Aquí </a>`,
            infoPeriod: `El texto que ingreses en el nombre del periodo se colocará despues del año.`,
            isValidDomain: false,
            sameUniversityError:  '*Tienes una universidad<br>ingresada con ese nombre',
            message: null,
            existError: false,
            nameExist: '',
            counter: 0,
            periodsData: [
                //{required: true}
            ],
            conditionalNamePeriod: true,
            allPeriodsIsIrregular: true,
            title: '',
            isEdit: false,
            optionsDisabled: [],
            prevDomain: '',
            prevTimeZone: '',
            prevPeriodsData: '',
            prevPeriod: '',
            prevEmailStructure: '',
            prevEmailExample: '',
            btnEdit: '',
            periodDataIsTheSame: true,
            notification: 0,
            qualification: 0,
            loading: false,
            universityOptions: [],
            nameValue: ''
        }
    },
    methods: {
        back(){
            let page = this.$route.query.page ? `?page=${this.$route.query.page}` : `?page=1`
            this.$router.push(`/countries/${this.$route.params.country}/universities${page}`)
        },
        cancel() {
            if(this.isEdit) this.$refs.confirmModal.open('icon-ic-universidades', '¿Estás seguro que deseas cancelar la edición de la universidad?', this.prevPage)
            else this.$refs.confirmModal.open('icon-ic-universidades', '¿Estás seguro que deseas cancelar la creación de esta universidad?', this.prevPage)   
        },
        submit() {
            this.$v.form.$touch()
            if(!this.$v.form.$invalid) {
                let text = this.$route.query.type == 'edit' ? ' editar los datos de' : '<br>agregar'
                this.$refs.confirmModal.open('icon-ic-universidades', `¿Estás seguro que deseas${text} esta universidad?`)
            }
        },
        async createUniversity() {
            try {
                await this.$store.dispatch('university/create', {
                    "name": this.form.name.name,
                    "nickName": this.abbreviation,
                    "emailStructure": this.form.emailStructure,
                    "domain": this.form.domain,
                    "exampleEmail": this.form.emailExample,
                    "idCountry": this.$route.params.country,
                    "timeZone": this.form.timeZone.value,
                    "numberPeriod": this.counter,
                    "namePeriods": this.periodsData.map( (item, i) => ({
                        name: item.name,
                        isIrregular: item.isIrregular,
                        position: i
                    }))
                })
                this.back()
            } catch(error) {
                if(!(error instanceof GatewayTimeoutError)) {
                    this.nameExist = this.form.name.name.slice()
                    this.message = error.message
                    this.existError = true
                } else 
                    this.$catchError(error)
            }
            this.$refs.confirmModal.close()
        },
        async editUniversity() {
            let conditional 
            if(this.detail.timeZone) {
                conditional = this.form.timeZone == this.detail.timeZone.name ? {
                    idTimeZone: this.detail.timeZone.idTimeZone,
                    name: this.detail.timeZone.name,
                    numberTimeZone: this.detail.timeZone.numberTimeZone
                } : {
                    idTimeZone: this.form.timeZone.value.idTimeZone,
                    name: this.form.timeZone.value.name,
                    numberTimeZone: this.form.timeZone.value.numberTimeZone
                }
            } else {
                conditional = {
                    idTimeZone: this.form.timeZone.value ? this.form.timeZone.value.idTimeZone : '', 
                    name: this.form.timeZone.value ? this.form.timeZone.value.name : '',
                    numberTimeZone: this.form.timeZone.value ? this.form.timeZone.value.numberTimeZone : ''
                }
            }
            try {
                await this.$store.dispatch('university/edit', {
                    "idCollege": this.detail._id,
                    "emailStructure": this.form.emailStructure,
                    "domain": this.form.domain,
                    "exampleEmail": this.form.emailExample,
                    "idCountry": this.detail.idCountry,
                    "timeZone": conditional,
                    "numberPeriod": this.counter,
                    "namePeriods": this.periodsData
                })
                this.back()
            } catch(error) {
                this.$store.dispatch('catchError', error)
                this.message = error.message
                this.existError = true
            }
            this.$refs.confirmModal.close()
        },
        async nameFilter(val, term){
            
        },
        selectPeriod(val) {
            this.periodsData = []
            this.counter = val
        },
        periodSaveInfo(val) {
            let typeOperation = val.typeOperation
            this.periodsData[val.position] = { name: val.name, isIrregular: val.isIrregular, required: val.required, idNamePeriod: val.idNamePeriod, typeOperation }
            //Name period repeat
            let conditionalNameError = this.periodsData.filter(i => i.required == true)
            this.conditionalNamePeriod = Boolean(conditionalNameError.length)
            // All period is Irregular
            let conditionalPeriodIrregular = this.periodsData.filter(i => i.isIrregular == false)
            this.allPeriodsIsIrregular = Boolean(conditionalPeriodIrregular.length)
            
            this.periodDataCompare()
        },
        newEditPage() {
            switch(this.$route.query.type) {
                case('new'):
                    this.title = 'Nueva Universidad'
                    this.isEdit = false
                    this.counter = 0
                    break
                case('edit'):
                    this.title = 'Editar Universidad'
                    this.isEdit = true
                    //prueba
                    this.counter = this.form.period = this.prevPeriod = this.detail.namePeriods.length || 0
                    for(let i = 0; i < this.periods.length; i++) {
                        this.optionsDisabled.push( i >= this.counter - 1 ? false : true)
                    }
                    this.prevPeriodsData = this.detail.namePeriods
                    this.form.name = this.detail.name
                    this.form.abbreviation = this.detail.nickName
                    this.form.emailStructure = this.prevEmailStructure = this.detail.emailStructure
                    this.form.domain = this.prevDomain = this.detail.domain
                    this.form.emailExample = this.prevEmailExample = this.detail.exampleEmail
                    this.prevTimeZone = this.detail.timeZone.name
                    this.form.timeZone = this.detail.timeZone ? this.detail.timeZone.name || '' : ''
                    break
            }
        },
        action() {
            if(this.$route.query.type == 'new') {
                this.createUniversity()
            } else {
                this.editUniversity()
            }
        },
        selectUniversity(val) {
            this.form.abbreviation = val.value
            this.universityOptions = []
        },
        periodDataCompare() {
            let samePeriods = this.periodsData.filter((item, i) => {
                if(this.prevPeriodsData[i]) return this.prevPeriodsData[i].name == item.name &&  this.prevPeriodsData[i].isIrregular == item.isIrregular
            }
            ).length
            return this.periodDataIsTheSame = samePeriods == this.periodsData.length
        },
        notificationChange() {},
        qualificationChange() {},
        async remoteMethod(query) {
            if( query !== '') {
                this.loading = true
                setTimeout( async() => {
                    this.$emit('remoteMethod', query)
                }, 200)
            } else {
                this.universityOptions = []
                this.form.name = ''
            }
            this.loading = false
        }
    },
    validations: {
        form: {
            name: { required },
            domain: { 
                required,
                validDomain: withParams(
                    { type: '' },
                    value => /^@([a-z]|[a-z]?[a-z]+[a-z])(\.[a-z]{2,10}?|\.[a-z]{2,10}?\.[a-z]{2,10}?)$/.test(value)
                )
            },
            timeZone: { required },
            period: { required }
        }
    },
    watch: {
        'form.domain'(value) {
            let regex = /^@([a-z]|[a-z]?[a-z]+[a-z])(\.[a-z]{2,10}?|\.[a-z]{2,10}?\.[a-z]{2,10}?)$/
            this.isValidDomain = regex.test(value)
        },
        async nameValue(val) {
            try {
                if(val.length >= 3) {
                    this.loading = true
                    await this.$store.dispatch('university/getSuggestedUniversity', { id: this.$route.params.country, term: this.nameValue })
                    this.universityOptions = this.$store.state.university.suggestedUniversityList
                    this.loading = false
                }
            } catch(error) {
                this.$store.dispatch('catchError', error)
                this.universityOptions = []
            }
        },
        'form.name'(value) {
            if(this.nameExist == value.name) {
                this.existError = true
                this.message = this.sameUniversityError
            } else {
                this.existError = false
                this.message = ''
            }
        },
        'form.period'(val) {
            for(let i = 0; i < val; i++) {
                let conditionalName, conditionalId, isIrregular, required, typeOperation

                function setVariables() {
                    conditionalName = ''
                    conditionalId = ''
                    isIrregular = false
                    required = true
                    typeOperation = crudStatus.CREATED 
                }
                if(this.detail.namePeriods) {
                    if(this.detail.namePeriods.length > i) {
                        conditionalName = this.detail.namePeriods[i] ? this.detail.namePeriods[i].name : ''
                        conditionalId = this.detail.namePeriods[i] ? this.detail.namePeriods[i].idNamePeriod : ''
                        isIrregular = this.detail.namePeriods[i] ? this.detail.namePeriods[i].isIrregular : false
                        required = conditionalName == '' ? true : false
                        typeOperation = this.detail.namePeriods[i] ? crudStatus.ORIGINAL : crudStatus.CREATED
                    } else {
                        setVariables()
                    }
                } else {
                    setVariables()
                }
                this.periodsData.push(
                    {
                        name: conditionalName, 
                        position: i, 
                        idNamePeriod: conditionalId, 
                        isIrregular: isIrregular,
                        required: required,
                        typeOperation: typeOperation
                    }
                )
            }
        },
        multipleListener(val) {
            if(
                this.form.domain == this.prevDomain &&
                this.isTheSameTimeZone &&
                this.form.emailStructure == this.prevEmailStructure &&
                this.form.emailExample == this.prevEmailExample &&
                this.periodDataIsTheSame &&
                this.form.period == this.prevPeriod
            ) {
                this.btnEdit = false
            } else {
                if(!this.domainRules.length && this.form.timeZone !== '' )
                    // this.btnEdit = !this.periodDataIsTheSame
                    this.btnEdit = true

                else 
                    this.btnEdit = this.conditionalNamePeriod
            }
        }
    },
    computed: {
        ...mapState({
            // 'universityOptions': state => state.university.suggestedUniversityList,
            'timeZoneOptions': state => state.university.timeZoneList,
            'detail': state => state.university.detailUniversity
        }),
        nameRules() {
            return [
                !this.$v.form.name.$dirty || this.$v.form.name.required || '*Debes de ingresar un nombre',
                !this.$v.form.name.$dirty || !this.existError || ''
            ].filter( val => typeof(val) == 'string' )[0]
        },
        domainRules() { 
            return [
                !this.$v.form.domain.$dirty || this.$v.form.domain.required || '*Debes de ingresar el dominio del correo',
                !this.$v.form.domain.$dirty || this.$v.form.domain.validDomain || '*Debes de ingresar un dominio válido'
            ].filter( val => typeof(val) == 'string' )
        },
        timeZoneRules() {
            return [
                !this.$v.form.timeZone.$dirty || this.$v.form.timeZone.required || '*Debes seleccionar un zona horaria'
            ].filter( val => typeof(val) == 'string' )[0]
        },
        periodRules() {

        },
        btnDisabled() {
            if(this.$route.query.type == 'edit') {
                return this.$v.form.$invalid || !this.btnEdit || this.conditionalNamePeriod || !this.allPeriodsIsIrregular
            } else {
                return this.$v.form.$invalid || !this.$v.form.$dirty  || this.$v.form.$error || this.conditionalNamePeriod || !this.allPeriodsIsIrregular
            }
        },
        abbreviation() {
            return this.form.name ? this.form.name.value : ''
        },
        periods() {
            this.periodDataCompare()
            let periods = []
            let numPeriod
        
            numPeriod = 10
            for(let i = 0; i < numPeriod; i++) {
                periods.push({name: `${i +1}`, position: i +1, required: true})
            }
            
            return periods
        },
        multipleListener() {
            return[
                this.form.domain,
                JSON.stringify(this.form.timeZone),
                this.form.emailStructure,
                this.form.emailExample,
                this.form.period,
                JSON.stringify(this.periodsData),
                this.periodDataIsTheSame
            ].join()
        },
        isTheSameTimeZone() {
            return this.form.timeZone.name ? this.form.timeZone.name == this.prevTimeZone : this.form.timeZone == this.prevTimeZone
        }
    },
    async created() {
        this.newEditPage()
        eventBus.$on('save', () => {
            this.action()
            setTimeout(() => {
                eventBus.$emit('closeConfirm')
            }, 500)
        })
        let page = this.$route.query.page ? `?page=${this.$route.query.page}` : `?page=1`
        this.prevPage = `/countries/${this.$route.params.country}/universities${page}`
    },
    mounted() {
        this.$nextTick(()=> {
            let input = document.querySelector('.name-item input')
            input.addEventListener('keyup', () => {
                if(input.value == '') {
                    this.form.name = ''
                    this.form.abbreviation = ''
                    this.universityOptions = []
                } else {
                    this.nameValue = input.value
                }
            })
        })
    }
}
</script>
<style lang="sass" scope>
    .el-select-dropdown
        //min-width: unset !important
        // max-width: 235px 
        border: 0.5px solid #DCDFE6
        border-radius: 8px
        background-color: #FFFFFF
        box-shadow: 2px 6px 12px 0 rgba(198,212,212,0.5)
        .el-select-dropdown__wrap
            max-height: 120px
            .el-select-dropdown__item.hover
                background-color: rgba(18,131,255,0.05)
            .el-select-dropdown__item
                height: 28px
                line-height: 28px
                span
                    color: #909399
                    font-family: "Open Sans"
                    font-size: 9px
                    line-height: 26px
        .el-scrollbar__bar.is-vertical
            .el-scrollbar__thumb
                width: 50%
    .new-university
        padding-bottom: 90px
        .el-form
            margin-top: 65px
        .el-input__inner
            background-color: #fff !important
            width: 340px
            border: 0.5px solid #DCDFE6
            color: $label-form-color
            font-weight: 100
            font-family: $default-font
            -webkit-font-smoothing: antialiased
        &:input
            padding: 0 10px
            text-overflow: ellipsis
            white-space: nowrap
            overflow: hidden
        .input-abbrev
            .el-input__inner 
                width: 117px
        .input-domain
            .el-input__inner
                width: 276px
        .el-form-item
            display: flex
        .el-form-item__label
            font-size: 14px
            color: $label-form-color
            font-family: $default-font
            -webkit-font-smoothing: antialiased
            font-weight: 300
        .input__rule
            position: absolute
            left: 125px
            font-family: $default-font
            font-size: 12px
            width: 200px
            color: $label-form-color
            -webkit-font-smoothing: antialiased
        .el-select 
            .el-input__inner
                -webkit-font-smoothing: antialiased
                font-weight: 100
                
        .name-item
            .el-select__caret
                display: none
            .el-form-item__error
                min-width: 355px
                text-align: left
                font-size: 12px
                // margin-top: -31px
        .email-structure-item
            position: relative
            .icon-ic-info
                cursor: pointer
                position: absolute
                left: 355px
                font-size: 18px 
                color: $main-color
        .is-disabled--input
            background-color: #fff !important
            border-color: #fff
        .select__caret-style
            .el-input__inner
                width: 170px
                white-space: nowrap !important
                overflow: hidden !important
                text-overflow: ellipsis !important
                outline: none
        input
            line-height: 18px
            font-family: "Open Sans"
    .popper-domain.el-tooltip__popper
        width: 150px
        min-height: 50px
        padding: 15px 15px
        line-height: 1.3 !important
        font-weight: 100px
        -webkit-font-smoothing: antialiased
        .tooltip-content
            color: #FFFFFF
            a 
                color: #FFFFFF
                font-weight: 600
    .period-structure-item
        .icon-ic-info
            position: absolute
            right: -30px
            font-size: 18px 
            color: $main-color
            cursor: pointer
    .el-input.el-input--suffix.is-focus
        &:input
            white-space: nowrap
            overflow: hidden
            text-overflow: ellipsis
    .el-form-item
        .el-form-item__content
            margin-left: 0 !important


    .notifications-configuration
        h3 
            font-size: 20px
        .el-input-number
            width: 132px
            .el-input__inner
                width: inherit
                border: 0.5px solid #ecedf2
                outline: none
                border-color: #ecedf2 !important
    .notifications-configuration__box
        display: flex
        align-items: center
        width: 450px
        justify-content: space-between
        p, span 
            color: #909399
            font-size: 14px
            font-family: $default-font
        .el-input-number__decrease,
        .el-input-number__increase 
            width: 35px
            background-color: #f8f9fa
            i 
                font-size: 15px
                color: #919398
                position: relative
                top: 3px
                &:before
                    font-family: "fontastic" !important
        .el-input-number__decrease
            i:before
                content: "V"
        .el-input-number__increase 
            i:before
                content: "W"
        .el-input-number__decrease, .el-input-number__increase
            &:hover
                background-color: #ecf5ff !important
                i::before
                    color: #1283FF !important
</style>

