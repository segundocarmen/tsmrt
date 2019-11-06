<template lang="pug">
    .card__calendar
        h3.subtitle__blue-general Calendario Académico
        h4.subtitle__black__calendarie Agrega los periodos académicos y configura la fecha de inicio y fin de cada uno.
        .year__container.el-form-item
            .year__info-content
                period(v-for=" (calendar, i) in countPeriods", 
                    ref="period" 
                    :periodPosition="i" 
                    :period="calendar", 
                    :calendarDates.sync="calendarEndDates" 
                    :calendaries="calendaries"
                    :periodNameList="periodNameList"
                    :key="i" 
                    :periodsArray.sync="calendaries"
                    :endDatesList.sync="initEndDates"
                    @changeDataPeriod="changeDataPeriod"
                    @cleanPeriod="cleanPeriod"
                    @deletePeriod="deletePeriod"
                    @error="error"
                    @changeName="updateNamePeriod"
                )
                el-row(type="flex" justify="center")
                    el-button.button__style.add-new(@click="addPeriod") AGREGAR NUEVO
                        i.icon-ic-add-normal
</template>

<script>
    import period from '~/components/courses/period-item'
    import { eventBus } from '~/event-bus'
    
    export default {
        props: ['calendaries', 'countPeriods', 'notificationDay', 'qualifyDay', 'periodNameList'],
        components: {
            period
        },
        data() {
            return {
                calendarEndDates: [],
                initEndDates: [] 
            }
        },
        methods: {
            changeDataPeriod({name, idName, startDate, endDate, periodPosition, yearPosition, inputsComplete, typeOperation, idPeriod }) {
                let periods = this.calendaries
                if(periods[periodPosition].endString !== endDate || periods[periodPosition].startString !== startDate) {
                    periods[periodPosition] = { name: name, idName, idPeriod: idPeriod, endString: endDate, startString: startDate, typeOperation, required: inputsComplete }
                }
                this.setInitDates('changeYearSelected')
                eventBus.$emit('changeYearSelected', { position: periodPosition, date: periods[periodPosition].startString })
            },
            setInitDates() {
                this.initEndDates = []
                this.calendaries.forEach((item, x) => {
                    if(item.endString) {
                        let date = this.dateTransform(item.endString)
                        this.initEndDates.push(date)
                    } else {
                        this.initEndDates.push(null)
                    }
                })
            },
            error(val) {
                this.namePeriodIsRequired =  val.length == 0 ? false : true
            },
            handleChange(value) {
                //console.log(value)
            },
            addPeriod(val) {
                this.$emit('addPeriod')
                this.setInitDates()
            },
            deletePeriod(val) {
                this.$emit('deletePeriod', val)
            },
            cleanPeriod() {
                this.$emit('cleanPeriod')
            },
            updateNamePeriod(val) {
                let periods = this.calendaries
                periods[val.position] = {name: val.name, idPeriod: val.id, required: val.inputsComplete}
                this.$emit('updateNamePeriod', val)
            },
            dateTransform(value) {
                let date = value.split('-')
                return new Date(`${date[1]}-${date[2]}-${date[0]}`)
            },
        },
        watch: {
            calendarEndDates(val) {
                this.$emit('calendarUpdate', this.calendaries[val.length -1])
            },
            calendaries() {
                this.$emit('calendarUpdate', this.calendaries[this.calendarEndDates.length -1])
            }
        },
        mounted() {
            this.$nextTick(() => {
                eventBus.$on('setEndDates', ({ index, endDate }) => {
                    this.calendarEndDates.splice(index, 1, endDate)
                })
                this.setInitDates()
            })
        }
    }
</script>

<style lang="sass">
    .card__calendar
        .subtitle__black__calendarie
            color: #415061
            font-family: "Open Sans"
            font-size: 16px
            font-weight: 500
            letter-spacing: 0.42px
            line-height: 22px
        .subtitle__blue-general
            color: #1283FF
            font-family: Asap
            font-size: 20px
            font-weight: 600
            letter-spacing: 0.4px
            line-height: 23px
            margin-bottom: 45px
        .notifications__box
            width: 100%
            padding: 48px 20px
        .add-new
            width: 208px
            height: 42px
            border: 1px solid #1283FF
            border-radius: 24px
            padding: 0
            span
                color: #1283FF
                font-size: 12px
                font-weight: bold
                letter-spacing: 1px
                -webkit-font-smoothing: antialiased
                margin-left: -20px
            .icon-ic-add-normal
                color: #1283FF
                font-size: 16px
                margin-left: 7px
                position: absolute
        .el-input-number__increase, .el-input-number__decrease
            background-color: #F8F9FB !important
        .el-select
            input
                line-height: 10px !important
</style>