<template lang="pug">
    div.detail 
        h2.title__state-back
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            span Detalle de Solicitud

        h4.subtitle__blue-general.mt-35.title__type Tipo de solicitud
        h3.mb-25.smoothing-antialiased.request__type Curso Existente - Carrera
        ul.request__data 
            li 
                i.icon-ic-cursos
                strong CD0808 - Lenguaje y Redacción
            li 
                i.icon-ic-carreras
                strong Administración de Empresas
            li 
                i.icon-ic-ciclo
                strong Ciclo 06
            li 
                i.icon-ic-solicitudes
                span #[strong 08] solicitudes

        h3.subtitle__blue-general.f-20.mt-35 Solicitudes
        div.request__cards
            el-card(shadow="never") 
                div
                    h5.fz-10.mb-7 Solicitante:
                    p.fz-13.mb-20 Miriam Humaní Tejada
                div 
                    h5.fz-10.mb-7 Fecha de Reporte
                    p.fz-13.mb-20 21/11/18
                div 
                    h5.fz-10.mb-7 Carrera:
                    p.fz-13.mb-20 Ciencias de la Comunicación
            el-card(shadow="never") 
                div
                    h5.fz-10.mb-7 Solicitante:
                    p.fz-13.mb-20 Miriam Humaní Tejada
                div 
                    h5.fz-10.mb-7 Fecha de Reporte
                    p.fz-13.mb-20 21/11/18
                div 
                    h5.fz-10.mb-7 Carrera:
                    p.fz-13.mb-20 Ciencias de la Comunicación
        footer.footer-style.footer--request
            el-button.wabu-btn.wabu-btn--cancel.mr-5 ELIMINAR SOLICITUD
                i.icon-ic-desactivar
            el-button.wabu-btn.wabu-btn--save ACEPTAR SOLICITUD
                i.icon-ic-activar
</template>
<script>
export default {
    layout: 'university',
    data() {
        return {
            prevPage: ''
        }
    },
    mounted() {
        this.$nextTick(() => {
            let params = this.$route.params
            let term = this.$route.query.term ? `${this.$route.query.term}` : ''
            this.prevPage = `/countries/${params.country}/universities/${params.university}/requests?page=${this.$route.query.page}&term=${term}`
        })
    }
}
</script>
<style lang="sass">
    .title__type
        margin-bottom: 5px
        font-size: 10px
        font-family: $default-font
        font-weight: 600
        opacity: 0.7
    .request__type 
        font-weight: 600
    .request__data
        padding-left: 0 
        li 
            display: flex
            align-items: center
            margin-bottom: 10px
        span, strong 
            font-size: 14px
            letter-spacing: 0.53px
            font-family: $default-font
            color: #415061
            margin-left: 10px
        strong 
            -webkit-font-smoothing: antialiased
        span 
            > strong 
                margin: 0
        i 
            color: $main-color
            line-height: 1
    .request__cards
        display: flex
        margin-left: -15px
        margin-right: -15px
        .el-card 
            width: 432px
            min-height: 120px
            border: 1px solid rgba(198,212,212,0.33)
            border-radius: 7.58px
            margin: 0 15px 
            .el-card__body
                display: flex
                flex-wrap: wrap
                padding: 25px 35px 5px
                box-sizing: border-box
                min-height: 120px
                > div 
                    flex-basis: 50%

            h5 
                font-family: $default-font
                color: #7B8FA0
                letter-spacing: 0.23px
                font-weight: 600
                -webkit-font-smoothing: antialiased
                opacity: 0.8
            p 
                font-family: $default-font
                color: #415061
                letter-spacing: 0.26px
                color: #415061

    .footer--request
        .el-button 
            width: 245px
            height: 42px
            span 
                font-size: 12px
                font-weight: 700
                letter-spacing: 0.9px
                -webkit-font-smoothing: antialiased
                display: flex
                align-items: center
                justify-content: center
                line-height: 0
                i 
                    font-size: 17px
                    margin-left: 5px
                    position: relative
                    top: -4px
            &.wabu-btn--cancel
                span 
                    i 
                        color: $main-color
            &.wabu-btn--save
                span 
                    i 
                        color: #ffffff
</style>

