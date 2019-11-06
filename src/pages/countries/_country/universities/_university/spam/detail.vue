<template lang="pug">
    .detail.spam-detail.mb-80
        section
            h2.title__state-back
                nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
                span.state_circle(:class="{'active': detalles.status }")
                | {{ detalles.fullName }}
        section.flex.mt-35
            img.img_detail_spam.mr-10(:src="detalles.urlPhoto")
            div 
                h3.text__blue.mb-5 Comentario
                p.text__gray {{ detalles.comment }}
        section.box__content.mt-30.flex
            ul
                li 
                    i.icon-ic-teacher
                    | {{ detalles.teacher }}
                li 
                    i.icon-ic-cursos
                    | {{ detail.course }}
                li 
                    i.icon-ic-comment
                    | {{ detalles.registerString }}
            ul
                li 
                    i.icon-ic-likes
                    | #[strong {{ detalles.studentLikes.length}}] Me gusta
                li 
                    i.icon-ic-dislike.red
                    | #[strong {{ detalles.studentDislikes.length }}] No me gusta
                li 
                    i.icon-ic-spam
                    | #[strong {{ detalles.countReport }}] Reportes
        section
            h4.subtitle.mb-10.mt-40 Reportes
            div(v-if="detalles.studentReports != 0")
                el-table.general__table(
                    ref='multipleTable', 
                    :data="detalles.studentReports"
                    style='width: 100%', 
                    @sort-change="sortChange"
                   
                )
                    el-table-column( sortable="custom" property=`firstName` label='Alumno'  @sort-method="sortBy")
                    el-table-column( sortable="custom" property='reportString' label='Fecha')
            div.message__no-data(v-else)
                h3 {{ notData }}
        footer(:class="{ 'disabled' : btnDisabled}" v-if="detalles.status != 6")
            p.footer__error-message(v-html='errorMessage')
            el-button.mr-15(plain round :disabled="btnDisabled" @click="cancel").wabu-btn--edit.wabu-btn--cancel BLOQUEAR COMENTARIO
                i.icon-ic-desactivar.icon__style
            el-button(type="primary" round :disabled="btnDisabled" @click="save").wabu-btn--edit.wabu-btn--save LIMPIAR SPAM
                i.icon-blue.icon__style
        confirmModal(ref="confirmModal" @save="saveData")
</template>

<script>
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
import { spamStatus, status } from "~/enums";
export default {
  layout: "university",
  components: {
    confirmModal
  },
  head: {
    title: "Detalle no deseados"
  },
  data() {
    return {
      detail: {
        status: true,
        firstName: "Alonso",
        lastName: "Sanchez Díaz",
        comment:
          "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat mas.",
        imgUrl:
          "https://st-listas.20minutos.es/images/2011-05/287031/2991786_640px.jpg?1305917794",
        nameTeacher: "Martín Otiniano",
        course: "Contabilidad",
        date: "28/10/12",
        likes: "100",
        dislikes: "10",
        reports: "01",
        list: [{ student: "Alejandro Rodriguez Diez", date: "03/12/2018" }]
      },
      prevPage: "",
      notData: "No hay contenido de reportes",
      btnDisabled: false,
      errorMessage: "",
      isTypeClean: null
    };
  },
  computed: {
    statusClass(status) {
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
        default:
          return "blocking";
      }
    },
    ...mapState({
      detalles: state => state.spam.detail[0]
    })
  },
  methods: {
    cancel() {
      this.isTypeClean = false;
      this.$refs.confirmModal.open(
        "icon-ic-desactivar",
        `Desea bloquear este comentario?`
      );
    },
    save() {
      this.isTypeClean = true;
      this.$refs.confirmModal.open(
        "icon-blue",
        `Desea activar este comentario?`
      );
    },
    sortChange() {},
    sortBy(val) {
      //console.log(val)
    },
    decodeStatus(status) {},
    saveData(type) {
      //console.log(type);
      let state = null;
      if (!this.isTypeClean) {
        state = spamStatus.BLOCKING;
      } else {
        state = spamStatus.ACTIVE;
      }
      let data = {
        comments: [
          {
            idStudent: this.detalles.idStudent,
            idCommentStudent: this.detalles.idCommentStudent,
            idTeacher: this.detalles.idTeacher,
            idCourse: this.detalles.idCourse,
            idPeriod: this.detalles.idPeriod,
            status: this.detalles.status
          }
        ],
        status: state
      };
      console.log(data);
      this.$store.dispatch("spam/BloqComment", data);
      this.$router.push(this.prevPage);
    }
  },
  async fetch({ store, params, query, route }) {
    await store.dispatch("spam/getDetail", route.query.id);
  },
  created() {
    let params = this.$route.params;
    this.prevPage = `/countries/${params.country}/universities/${
      params.university
    }/spam?page=${this.$route.query.page}`;
  }
};
</script>