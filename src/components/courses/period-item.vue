<template lang="pug">
    el-form.elform__style
        div.year__period-content
            el-button(circle @click="deletePeriod")
                i.icon-ic-cross-normal
            el-form-item.year__list-item.name(:error="periodNameErrorMessages[0]")
                el-row(type="flex")
                    p {{yearSelect}}
                    el-row.period__box
                        span.label__style Nombre del Periodo
                        el-select.select__caret-style(
                            v-model="periodName" 
                            @input="$v.periodName.$touch()"
                            placeholder='Selecciona el periodo'
                            @change="changeName"
                            value-key="name"
                        )
                            el-option.class(v-for="(item, i) in periodNameList" :key="i" :label="item.name" :value="item")
            div.year__list-item
                span.label__style.date Fecha
                el-date-picker.date_picker-styles( 
                    v-model="periodDate",
                    type="daterange",
                    ref="periodPicker"
                    range-separator="Hasta",
                    start-placeholder="Inicio",
                    end-placeholder="Fin",
                    label="Fecha"
                    value-format="yyyy-MM-dd"
                    format="dd-MM-yyyy"
                    :picker-options="pickerOptions"
                    align="right"
                    :default-value="currentDate"
                )
</template>
<script>
import { minLength, required } from 'vuelidate/lib/validators'
import { eventBus } from '~/event-bus'
import { crudStatus } from '~/enums'

export default {
    props: { 
        period: [Object, Array ],
        periodPosition: Number,
        periodsArray: Array,
        calendarDates: Array,
        calendaries: Array,
        endDatesList: Array,
        periodNameList: Array
    },
    data(){
        return {
            periodName: this.period ? this.period.name : '' ,
            periodDate: '',
            endDate: null,
            yearSelect: 'Año',
            periodDate2: ''
        }
    },
    validations() {
        return{ 
            periodName:{
                required
            },
            periodDate: {
                required
            }
        }
    },
    computed: {
        currentDate() {
            return this.$moment().format('YYYY-MM-DD')
        },
        periodNameErrorMessages() {
            return [].filter( val => typeof(val) == 'string')
        },
        pickerOptions() {
            let self = this
            let currentDate = this.$moment().toDate()            

            return {
                disabledDate (date) {
                    return date <= self.endDate
                },
                firstDayOfWeek: 1
            }
        },
        conditional() {
            if(this.periodDate == null) {
                return false
            }else {
                return true
            }
        },
        inputsRequired() {
            if(this.periodDate) {
                let conditional = this.periodDate.filter(e => e == '')
                return this.periodName !== '' && !Boolean(conditional.length) ? false : true
            } else {
                return this.periodName !== '' && this.periodDate !== null ? false : true
            }
        }
        
    },
    watch: {
        calendarDates: {
            immediate: true,
            handler(val) {
                if(this.period) {
                    this.periodName = this.period.name
                    if(this.period.startString.length && this.period.endString.length)
                        this.periodDate = [ this.period.startString, this.period.endString ]
                    else 
                        this.periodDate = ''
                }
                this.setEndDatesList()
            }
        },
        endDatesList() {
            this.setEndDatesList()
        },
        periodName(val) {
            this.changeDataPeriod() 
        },
        periodDate(oldValue, newValue) {
            if(JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                this.changeDataPeriod()
                eventBus.$emit('setEndDates', { index: this.periodPosition, endDate: this.periodDate ? this.periodDate[0] : null } )
            }
            this.setEndDatesList()
        },
        periodNameErrorMessages(val) {
            this.$emit('error', val)
        },
        calendaries(val) {
            let period = val[this.periodPosition]
            if(this.period) {
                this.periodName = period.name
                if(period.startString.length && period.endString.length)
                    this.periodDate = [ period.startString, period.endString ]
                else 
                    this.periodDate = ''
            }
          }
    },
    methods: {
        dateTransform(value) {
            let date = value.split('-')
            return new Date(`${date[1]}-${date[2]}-${date[0]}`)
        },
        changeDataPeriod() {
            let idName = this.periodName.idNamePeriod
            this.$emit('changeDataPeriod', {
                'name': this.periodName.name ? this.periodName.name : this.periodName,
                //'name': '',
                'idPeriod': this.period.idPeriod,
                idName,
                'startDate': this.periodDate ? this.periodDate[0] : '',
                'endDate': this.periodDate ? this.periodDate[1] : '',
                'periodPosition': this.periodPosition, 
                'inputsComplete': this.inputsRequired,
                'typeOperation': this.period.idPeriod ? crudStatus.UPDATED : crudStatus.CREATED
            })
        },
        deletePeriod() {
            this.$emit('deletePeriod', this.periodPosition)
        },
        cleanPeriod() {
            this.periodName = ''
            this.periodDate = ''
            //this.$refs.periodPicker.cleanPeriod()
        },
        changeName(val){
            this.$emit('changeName', {name: val.name, id: this.period.idPeriod, position: this.periodPosition, inputsComplete: this.inputsRequired})
        },
        setEndDatesList() {
            if(this.periodPosition !== 0 && this.endDatesList){
                for(var i = this.periodPosition - 1; i >= 0; i--) {
                    if(this.endDatesList[i]) {
                        this.endDate = this.endDatesList[i]
                        return
                    } else {
                        this.endDate = null
                    }
                }
            } else this.endDate = null
        }
    },
    mounted() {
        this.$nextTick(() => {
            //this.yearSelect = this.period.startString.split('-').shift() || 'Año'
            let condition = this.calendarDates.filter(e => e == '')
            if(condition.length)
                this.periodDate = ''
            else
                return

        })
    },
    created() {
        if(this.period) {
            if(this.period.startString.length && this.period.endString.length) this.periodDate = [ this.period.startString, this.period.endString ]
            else this.periodDate = ''
        }

        eventBus.$on('changeYearSelected', ({ position, date}) => {
            if(position == this.periodPosition) this.yearSelect = date.split('-').shift() || 'Año'
        })
    }

}
</script>

<style lang="sass">
    .elform__style
        padding-bottom: 30px
        .year__period-content
            border: 1px solid #ebeef5
            border-radius: 6px
            background-color: rgba(255,255,255,0.4)
            width: 441.16px
            @include transition(0.2s)
            .label__style
                margin-bottom: -4px
                font-weight: 300
            &:hover 
                box-shadow: 2px 6px 12px 0 rgba(198,212,212,0.33)
            .year__list-item
                padding: 20px 30px 0
            .el-row
                width: 100%
            p
                margin-right: 30px
                font-size: 14px
                color: #909399
                -webkit-font-smoothing: antialiased
                margin-top: 50px
                line-height: 1
            .el-button.is-circle
                background-color: #9E9E9E !important
                padding: 2px 3.5px
                border: 0
                width: 13px
                height: 13px
                span
                    transform: translateX(-8%)
                    display: inline-block
                i
                    font-size: 7px
                    color: #fff
            .el-button
                font-size: 10px
                float: right
                margin: 12px
            .name
                padding-right: 0
                padding-top: 10px
            .el-select
                .el-input__inner
                    &::-webkit-input-placeholder
                        font-size: 14px
                    &::-moz-placeholder
                        font-size: 14px
                    &:-ms-input-placeholder
                        font-size: 14px
                    &:-moz-placeholder
                        font-size: 14px
</style>
