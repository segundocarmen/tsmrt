<template lang="pug">
    el-card(shadow="never").especific-info-box
        h2.fz-16.bold {{ item.name }}
            span(v-if="item.code")  - {{ item.code }} 
        el-row.rating.mb-16.mt-20
            el-col(:span="12").cualification
                i.icon-yellow.mr-4
                span.bolder.fz-12 {{ item.totalAverageQualifications }}
            el-col(:span="12").number-of-cualifications
                i.icon-ic-persona
                span.fz-12.ml-4.bold {{ item.totalCountQualifications }} Calificaciones

        div.flex-layout.progress-learning.mb-24
            i.icon-ic-aprendiste
            div.w-100
                h5 ¿QUÉ TANTO APRENDISTE?
                    span.points {{ item.countRequiredLearn }} Pts
                el-progress(:percentage="calculatePercentage(item.countRequiredLearn, 5)" :show-text="false").progress.progress--large
        
        div.flex-layout.progress-qualification.mb-24
            i.icon-ic-califica
            .w-100
                h5 ¿QUÉ TAN ALTO CALIFICA?
                    span.points {{ item.countRequiredHight }} Pts
                el-progress(:percentage="calculatePercentage(item.countRequiredHight, 5)" :show-text="false").progress.progress--large
        
        div.flex-layout.progress-attitude.mb-24
            i.icon-turquesa
            .w-100
                h5 ¿QUÉ TAN BUENA GENTE ES?
                    span.points {{ item.countRequiredGoodPeople }} Pts
                el-progress(:percentage="calculatePercentage(item.countRequiredGoodPeople, 5)" :show-text="false").progress.progress--large
        div.optional-data
            h4.fz-10.bold.mb-20 DATOS OPCIONALES
            div.flex-layout.mb-36
                i.icon-ic-muchotrabajo
                div
                    h5 ¿DEJA MUCHO TRABAJO?
                    el-progress(:percentage="calculatePercentage(item.countOptionalWorked, 3)" :show-text="false").progress.progress--small
                    .flex-layout.text
                        span Poco
                        span Mucho
                .number-of-cualifications
                    i.icon-ic-persona.mr-0.fz-8
                    span.fz-8.ml-4.bold #[strong {{ item.optionalWorked }}] Calificaciones
            div.flex-layout.mb-36
                i.icon-purple
                div
                    h5 ¿PERMITE LLEGAR TARDE?
                    el-progress(:percentage="calculatePercentage(item.countoptionalLate, 3)" :show-text="false").progress.progress--small
                    .flex-layout.text
                        span Nunca
                        span Siempre
                .number-of-cualifications
                    i.icon-ic-persona.mr-0.fz-8
                    span.fz-8.ml-4.bold #[strong {{ item.optionalLate }}] Calificaciones
            div.flex-layout.mb-36
                i.icon-ic-asistencia
                div
                    h5 ¿TOMA ASISTENCIA?
                    el-progress(:percentage="calculatePercentage(item.countOptionalAssistance, 3)" :show-text="false").progress.progress--small
                    .flex-layout.text
                        span Nunca
                        span Siempre
                .number-of-cualifications
                    i.icon-ic-persona.mr-0.fz-8
                    span.fz-8.ml-4.bold #[strong {{ item.optionalAssistance }}] Calificaciones

</template>

<script>
export default {
    props: ['item'],
    methods: {
        calculatePercentage(currentVal, maxVal) {
            if(!currentVal) currentVal = 0 
            return (Number(currentVal) * 100) / Number(maxVal) 
        }
    }
}
</script>

<style lang="sass">
    .especific-info-box 
        width: 300px
        min-height: 400px
        padding: 28px 23px 0
        background-color: #ffffff
        border-radius: 8px
        box-shadow: 2px 6px 12px 0 rgba(198,212,212,0.33)
        box-sizing: border-box
        .el-card__body
            padding: 0
        h2 
            letter-spacing: 0.61px
            color: #415061
        h5  
            color: $gray
            font-family: $default-font
            font-size: 8px
            letter-spacing: 0.27px
            font-weight: 600
            margin-bottom: 6px
            position: relative
        h4 
            color: $gray
            letter-spacing: 0.33px
            font-family: $default-font
        .flex-layout
            align-items: flex-end
            i
                font-size: 14px
                margin-right: 8px
                line-height: 0.7
            .points 
                color: $gray
                letter-spacing: -0.27px
                font-family: $default-font
                font-size: 8px
                font-weight: 800
                position: absolute
                right: 0
            .progress 
                width: 100%
                .el-progress-bar__outer
                    height: 9px !important
        .icon-ic-calification-normal
            color: red
        .cualification 
            i 
                color: $yellow
                font-size: 14px
            span 
                font-family: $default-font
        .number-of-cualifications
            i 
                font-size: 12px
            span 
                font-family: $default-font
                color: $gray
                letter-spacing: 0.4px
        .progress-learning 
            i
                color: $main-color
            .el-progress-bar__inner
                background-color: $main-color
                opacity: 0.8
        .progress-qualification
            i 
                color: #7666FE
            .el-progress-bar__inner
                background-color: #7666FE
                opacity: 0.8
        .progress-attitude
            i 
                color: #00D0C8
            .el-progress-bar__inner
                background-color: #00D0C8
                opacity: 0.8
        .el-progress-bar__outer 
            background-size: contain
        .progress--large
            .el-progress-bar__outer 
                background-image: url('../../assets/images/background/barra.png') !important
        .progress--small
            .el-progress-bar__outer
                background-image: url('../../assets/images/background/barra-2.png') !important
        .optional-data
            i 
                color: #9752FF
            .el-progress-bar
                width: 137px
                .el-progress-bar__outer  
                    background-size: auto
                    background-position: center
                .el-progress-bar__inner
                    opacity: 0.8
                    background-color: #9752FF
            .text 
                justify-content: space-between
                font-size: 8px
                font-weight: 600
                letter-spacing: 0.23px
                color: #415061
                opacity: 0.8
                width: 137px
                line-height: 0
                top: 9px
                position: relative
            .number-of-cualifications
                text-align: right
                width: 100%
                position: relative
                i 
                    font-size: 8px
                    position: absolute
                    margin: 0
                    left: 13px
                    bottom: 3px
                span 
                    letter-spacing: 0.27px
                    strong 
                        color: #7B8FA0
        
</style>

