<template lang="pug">
    .students__style.detail__student
        h4.title__state-back
            span.state_circle(:class="{'active': detail.status == 1 }")
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            | {{ detail.name || '--' }}
            i.icon__edit.icon-ic-edit-normal(@click="edit")
        section.d-flex.flex-start
            div.box__image__student.mt-10
                img.style__img(:src="detail.url")
                img.style__emblemed(:src="imagePluma")
                p.subtitle.center {{detail.levelName || '--' }} #[br]
                    strong {{ detail.points || '0' }}
            div.box--information
                ul.style__box__basic__information
                    li
                        h6
                            i.icon-ic-uploads
                            strong {{ detail.countUploadDocument || '0'}}
                        p Documento #[br] subidos
                    li
                        h6
                            i.icon-ic-downloads
                            strong {{ detail.countDowloadDocument || '0'}}
                        p Descargas a mis #[br] documentos
                    li
                        h6
                            i.icon-ic-likes
                            strong {{ detail.countLikeDislikeComment || '0' }}
                        p Me gusta y #[br] no me gusta
                    li
                        h6
                            i.icon-ic-spam
                            strong {{ detail.countSpamReport  || '0'}}
                        p Reportes de #[br] SPAM
                ul.style__box__blue
                    li
                        h6 Fecha de Nacimiento
                        p {{ detail.birthString || '--' }}
                    li
                        h6 Sexo
                        p {{ detail.sex || '--' }}
                    li
                        h6 Fecha de Creación
                        p {{ detail.registerString || '--' }}
                ul.style__box__blue
                    li
                        h6 Correo Personal
                        p {{ detail.email || '--' }}
                    li
                        h6(style="visibility: hidden") ---
                        el-checkbox.embajador__checkbox(v-model="checkedEmbajadorWabu" @change="isEmbajadorWabu") Embajador Wabu
        section
            h3.subtitle__blue Dirección
            ul.style__box
                li
                    h6 Departamento
                    p(v-if="detail.ubigeo[0] != undefined") {{ detail.ubigeo[0].description || '--'}}
                li
                    h6 Provincia
                    p(v-if="detail.ubigeo[1] != undefined") {{ detail.ubigeo[1].description || '--'}}
                li
                    h6 Distrito
                    p(v-if="detail.ubigeo[2] != undefined") {{ detail.ubigeo[2].description || '--'}}
                li
                    h6 Dirección
                    p {{ detail.address || '--'}}
        section
            h3.subtitle__blue Información Académica
            ul.style__box__academy
                li
                    h6 Año de Ingreso
                    p {{ detail.yearEntry || '--'}}
                li
                    h6 Estado de Matricula
                    p {{ detail.statusRegisterEnrollment || '--'}}
                li
                    h6 Año de Egreso
                    p {{ detail.yearExit || '--'}}
                li
                    h6 Carrera
                    p {{ detail.career || '--'}}
                li
                    h6 Ciclo Actual
                    p {{ detail.currentCicle || '--'}}
                li
                    h6 Sede
                    p {{ detail.location || '--'}}
        section.email__box
            h5.style-email Correo Universitario
            div.d-flex.mt-5
                el-checkbox.email__checkbox(v-model="detail.isEmailCollegeValidate" disabled)
                p.email__style {{ detail.emailCollege || '--' }}
                el-button.wabu-btn--cancel.btn__validate(:disabled="detail.isEmailCollegeValidate" plain round size="mini" @click="validStudent") VALIDAR ALUMNO
        section.courses__box
            h3.subtitle__blue Cursos Actuales
            ul(v-if="existeCourses")
                li(v-for="item in detail.currentCourses")
                    p {{ item.course }}
                    span {{ item.cicle }}
            div.message__no-data(v-else)
                h3 No hay cursos actuales
        section
            h3.subtitle__blue Historial Académico
            div(v-if="existHistory")
                el-table.general__table.table__history(
                    ref='multipleTable', 
                    :data="listHistory"
                    style='width: 100%', 
                    :default-sort="defaultSort"
                    sortable
                    @sort-change="sortChange"
                )
                    el-table-column( sortable="custom", property='nameCourse' label='Curso')
                        template(slot-scope='scope') {{ scope.row.nameCourse }}
                    el-table-column( sortable="custom" property='cicle', label='Ciclo Asociado')
                    el-table-column( sortable="custom" property='period', label='Periodo')
                pagination.course__pagination(
                    v-if="showPagination"
                    :currentPage="currentPage"
                    :pageSize="pageSize"
                    :pageCount="pageCount"
                    layout="prev, pager, next, jumper"
                    :total="total"
                    @currentPage="pagination"
                )
            div.message__no-data(v-else)
                h3 No hay historial académico
        section
            h3.subtitle__blue Información Laboral
            ul.style__box
                li
                    h6 Puesto
                    p {{ detail.work || '--'}}
                li
                    h6 Empresa
                    p {{ detail.bussiness || '--'}}
                li
                    h6 Fecha de Ingreso
                    p {{ detail.endStart || '--'}}
                li
                    h6 Fecha de Salida
                    p {{ detail.endDate || '--'}}
        confirmModal(ref="confirmModal" @save="sendData")
</template>

<script>
import pagination from "~/components/shared/pagination";
import confirmModal from "~/components/modals/general";
import pluma from "~/assets/images/university/students/pluma.svg";
import iconEmbajadorWabu from "~/assets/images/university/students/ic_embajador.svg";
import { mapState } from "vuex";

export default {
  layout: "university",
  components: {
    pagination,
    confirmModal
  },
  head: {
    title: "Detalle del estudiante"
  },
  async fetch({ store, params, query }) {
    let page = query.pagetable ? Number(query.pagetable) : 1;

    store.commit("register-enrollment/setSortDetail", {
      sortName: "sortCourse",
      isAscending: -1
    });

    try {
      store.commit("register-enrollment/setPagination", page);
      await store.dispatch("students/getDetail", query.id);
      await store.dispatch("register-enrollment/getListHistory", query.id);
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    let checkedEmbajadorWabu = this.$store.state.students.detail
      .isEmbassadorWabu;
    let validEmail = this.$store.state.students.detail.isEmailCollegeValidate;
    return {
      nameStudent: "",
      prevPage: "",
      showPagination: true,
      checked: validEmail,
      imagePluma: pluma,
      checkedEmbajadorWabu: checkedEmbajadorWabu,
      iconEmbajadorWabu: iconEmbajadorWabu,
      image: "https://jooinn.com/images/young-man-19.jpg",
      action: "",
      defaultSort: { prop: "nameCourse", order: "ascending" }
    };
  },
  computed: {
    ...mapState({
      detail: state => state.students.detail,
      listHistory: state => state["register-enrollment"].listHistoryAcademic,
      pageSize: state => state["register-enrollment"].limit,
      pageCount: state => state["register-enrollment"].totalPage,
      total: state => state["register-enrollment"].totalHistoryAcademic,
      currentPage: state => state["register-enrollment"].page
    }),
    existeCourses() {
      if (this.detail.currentCourses) {
        return this.detail.currentCourses.length !== 0 ? true : false;
      } else {
        return false;
      }
    },
    existHistory() {
      if (this.listHistory) {
        return this.listHistory.length !== 0 ? true : false;
      } else {
        return false;
      }
    }
  },
  methods: {
    edit() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${this.$route.params.university}/students/edit`,
        query: {
          id: this.$route.query.id,
          page: page,
          term: this.$route.query.term
        }
      });
    },
    async sortChange(val) {
      let isAscending = val.order == "ascending" ? 1 : -1;
      let sortName;

      switch (val.prop) {
        case "nameCourse":
          sortName = "sortCourse";
          break;
        case "cicle":
          sortName = "sortCicle";
          break;
        case "period":
          sortName = "sortPeriod";
          break;
        default:
          return;
      }
      await this.$store.commit("register-enrollment/setSortDetail", {
        sortName,
        isAscending
      });
      await this.$store.dispatch(
        "register-enrollment/getListHistory",
        this.$route.query.id
      );
    },
    async pagination(val) {
      this.$store.commit("register-enrollment/setPagination", val);
      await this.$store.dispatch(
        "register-enrollment/getListHistory",
        this.$route.query.id
      );
      this.$router.push({
        query: {
          id: this.$route.query.id,
          page: this.$route.query.page,
          pagetable: val
        }
      });
    },
    validStudent() {
      this.action = "validStudent";
      this.$refs.confirmModal.open(
        "icon-ic-alumno",
        `¿Esta seguro? El estudiante tendrá acceso a toda la aplicación`
      );
    },
    async sendData() {
      this.checkedEmbajadorWabu = !this.checkedEmbajadorWabu;
      let id = this.$route.query.id;
      if (this.action == "validStudent") {
        try {
          await this.$store.dispatch("students/validateEmail", {
            idStudent: id,
            isEmailCollegeValid: this.checked
          });
          await this.$store.dispatch("students/getDetail", id);
        } catch (error) {
          this.$store.dispatch("catchError", error);
        }
      } else {
        try {
          await this.$store.dispatch("students/isEmbassadorWabu", {
            idStudent: id,
            isEmbassador: this.checkedEmbajadorWabu
          });
        } catch (error) {
          this.$store.dispatch("catchError", error);
        }
      }
      this.$refs.confirmModal.close();
    },
    isEmbajadorWabu(val) {
      let text = val == true ? "será" : "dejará de ser";
      this.action = "embajadorWabu";
      this.$refs.confirmModal.open(
        iconEmbajadorWabu,
        `¿Esta seguro? El estudiante ${text} embajador wabu`
      );
      this.checkedEmbajadorWabu = !this.checkedEmbajadorWabu;
    },
    cancel(val) {
      console.log(val);
    }
  },
  watch: {
    checked(val) {}
  },
  mounted() {
    this.$nextTick(() => {
      let params = this.$route.params;
      let term = this.$route.query.term ? `${this.$route.query.term}` : "";
      this.prevPage = `/countries/${params.country}/universities/${params.university}/students?page=${this.$route.query.page}&term=${term}`;
    });

    document.body.addEventListener("keyup", e => {
      if (e.keyCode == 27)
        this.$refs.confirmModal ? this.$refs.confirmModal.close() : "";
    });
  },
  beforeDestroy() {
    document.body.removeEventListener("keyup", e => {
      if (e.keyCode == 27) this.$refs.confirmModal.close();
    });
  }
};
</script>
<style lang="sass">
    .students__style
        .el-button--mini
            padding: 5px 15px
        .flex-start
            align-items: flex-start
</style>