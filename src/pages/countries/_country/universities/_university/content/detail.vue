<template lang="pug">
    .detail__content
        .head-box
            h4.title__state-back
                nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
                span.state_circle(v-if="isSpam" :class="getStatusClass(detail.status)")
                | {{ detail.title }}
            div.action__btns(v-if="isSpam")
                div
                    i.icon-ic-lookpassword(@click="openVisor")
        section.d-flex.mt-20.mb-25
            img.img__style(:src="image")
            div.ml-15
                p.text__detail Curso
                h5.subtitle__text.mt-4 {{ detail.courseCode }} - {{ detail.course }}
        section.d-flex.box__content.mb-30
            ul.mr-80
                li
                    i.icon-ic-alumno 
                    | {{ detail.studentFirstName }} {{ detail.studentLastName }}
                li
                    i.icon-cross-normal-copy
                    strong {{ detail.countDownload }} 
                    | Descargas
                li
                    i.icon-ic-likes
                    strong {{ detail.countLike }} 
                    | Me gusta
                li
                    i.icon-ic-dislike.red
                    strong {{ detail.countDislike }} 
                    | No me gusta
                li
                    i.icon-ic-desactivar
                    strong {{ detail.countReport }} 
                    | Reportes
                
            ul.ml-60
                li
                    i.icon-ic-teacher
                    | {{ detail.teacher }}
                li
                    i.icon-ic-calendario-normal
                    | Periodo #[strong {{ detail.period }}]
                li
                    i.icon-ic-download-copy
                    | {{ detail.uploadDate }}
        div(v-if="detail.description != ''")
          h3.subtitle__blue.smoothing-antialiased Descripción
          p.text__description.ml-25 {{detail.description}}
        h3.subtitle__blue.mt-40.smoothing-antialiased(v-if="isSpam") Reportes
        div.reports__container.mb-60(v-if="isSpam")
            el-card(shadow="never" v-for="report in detail.studentReport").mt-20
                div 
                    h5.fz-16 {{report.firstName}} {{report.lastName}}
                div.text-right
                    h6.fz-10 Fecha de Reporte
                    p.fz-14.mt-8 {{report.reportString}}
                div.reason 
                    h6.fz-10.mt-10 Motivo 
                    p.fz-13.mt-10  {{report.reason}}
        footer.footer-style(:class="{ 'disabled' : btnDisabled }" v-if="!isSpam")
            p.footer__error-message(v-html='errorMessage')
            el-button(:disabled="btnDisabled" @click="openBlockModal").wabu-btn.wabu-btn--cancel BLOQUEAR
                i.icon-ic-desactivar.icon__style
            el-button(type="primary" :disabled="btnDisabled" @click="openVisor").wabu-btn.wabu-btn--save VISUALIZAR
                i.icon-normal.icon__style
        
        footer.footer-style.is-spam(:class="{ 'disabled' : btnDisabled }" v-else)
            p.footer__error-message(v-html='errorMessage')
            el-button(:disabled="btnDisabled" @click="openBlockModal" v-if="detail.status != 4 && detail.status != 5").wabu-btn.wabu-btn--cancel BLOQUEAR CONTENIDO
                i.icon-ic-desactivar.icon__style
            el-button(type="primary" :disabled="btnDisabled" @click="openCleanSpamModal" v-if="detail.status != 5").wabu-btn.wabu-btn--save LIMPIAR SPAM
                i.icon-blue.icon__style

        confirmModal(ref="confirmModal" @save="submit")
        visorDocs(ref="visorDocs")
</template>

<script>
import visorDocs from "~/components/shared/visor-docs";
import confirmModal from "~/components/modals/general";
import { spamStatus, status } from "~/enums";
import { mapState } from "vuex";

export default {
  layout: "university",
  components: {
    confirmModal,
    visorDocs
  },
  head: {
    title: "Detalle del Contenido"
  },
  async fetch({ store, params, query }) {
    try {
      await store.dispatch("content/getDetail", query.id);
    } catch (error) {
      console.log(error);
      store.dispatch("catchError", error);
    }
  },
  data() {
    let params = this.$route.params;
    let page = this.$route.query.page ? `?page=${this.$route.query.page}` : "";
    return {
      prevPage: `/countries/${params.country}/universities/${
        params.university
      }/content${page}`,
      btnDisabled: false,
      errorMessage: "",
      image: this.$store.getters["content/routeImage"],
      isSpam: false,
      isTypeClean: null
    };
  },
  methods: {
    submit(type) {
      console.log(type);
      let state = null;
      if (!this.isTypeClean) {
        state = spamStatus.BLOCKING;
      } else {
        state = spamStatus.ACTIVE;
      }
      let data = {
        documents: [
          {
            idDocument: this.detail.idDocument,
            idStudent: this.detail.idStudent,
            status: this.detail.status
          }
        ],
        status: state
      };
      this.$store.dispatch("content/BloqContent", data);
      this.$router.push(this.prevPage);
    },
    openBlockModal() {
      this.isTypeClean = false;
      this.$refs.confirmModal.open(
        "icon-ic-desactivar",
        "¿Estás seguro que deseas bloquear este contenido? Se le restaran puntos al estudiante."
      );
    },
    openCleanSpamModal() {
      this.isTypeClean = true;
      this.$refs.confirmModal.open(
        "icon-blue",
        "¿Estás seguro que deseas limpiar el spam?"
      );
    },
    openVisor() {
      this.$refs.visorDocs.open(this.detail.urls, this.detail.typeFile);
    },
    getStatusClass(status) {
      switch (status) {
        case spamStatus.QUARINTINE:
          return "quarintine";
          break;
        case spamStatus.REPORTED:
          return "reported";
          break;
        case spamStatus.AUTOMATIC_BLOCK:
          return "automatic-block";
          break;
        case spamStatus.BLOCKING:
          return "blocking";
        default:
          return "active";
      }
    }
  },
  computed: {
    ...mapState({
      detail: state => state.content.detail
    })
  },
  created() {
    this.isSpam = this.$route.query.type == 2;
  }
};
</script>

<style lang="sass">
    .detail__content
        .action__btns
            justify-content: flex-end
        footer
            .el-button
                margin-left: 28px !important
                @include transition(0.2s)
                width: 154px
                height: 42px
                span 
                    font-size: 12px
                    font-weight: 700
                    letter-spacing: 0.9px
                    -webkit-font-smoothing: antialiased
                &.is-disabled 
                    opacity: 0.4
            &.is-spam 
                .wabu-btn--cancel
                    width: 269px
                .wabu-btn--save
                    width: 188px

        .footer__error-message 
            font-size: 12px
            color: #FF7C7C
            font-family: $default-font
            text-align: right
            line-height: 18px
            margin-right: 5px
        .icon__style
            font-size: 17px
            position: relative
            margin-left: 5px
            top: -3px
        .el-button.wabu-btn--edit
            width: 154px
        .wabu-btn--cancel
            i
                color: #1283FF
        .wabu-btn--save
            i
                color: #FFF

        
        .reports__container
            .el-card
                border-color: rgba(198,212,212,0.33)
                border-radius: 7.58px
                .el-card__body
                    padding: 25px 25px 30px
                    display: flex
                    flex-wrap: wrap
                    flex-basis: 50%
                    justify-content: space-between
                    -webkit-font-smoothing: antialiased 
                    > div 
                        flex-basis: 50%
                    h5
                        color: $main-color 
                        font-weight: 100
                    h6
                        color: #7B8FA0
                        font-weight: 100
                    .reason 
                        margin-top: -8px
</style>