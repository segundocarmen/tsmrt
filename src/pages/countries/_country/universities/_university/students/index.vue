<template lang="pug">
    div.page__students(v-bind:class=" {'search__transition': openSearch} ")
        div.courses
            .head-box
                h1.title Alumnos
                div.action__btns__students
                    div.search__box
                        i(@click="openSearchModal()").search.icon-ic-search-normal
                    div.options__btn
                        el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive} ").courses__dropdown
                            i.icon-ic-options-normal
                            el-dropdown-menu(slot='dropdown').dropdown--options
                                el-dropdown-item(@click.native="action('active')" v-if="showAbleDisable")
                                    i.icon-ic-activar
                                    | ACTIVAR ALUMNOS
                                el-dropdown-item(@click.native="action('inactive')" v-if="showAbleDisable")
                                    i.icon-ic-desactivar
                                    | DESACTIVAR ALUMNOS
                                el-dropdown-item 
                                    i.icon-cross-normal-copy
                                    | DESCARGAR REPORTE
                    .options__close
                        el-input.search__input-box(ref="searchInput" autofocus placeholder="Escribe el nombre o correo del alumno" v-model.trim="search" maxlength="50")
                            i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")
        div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="list != 0")
            el-table.general__table(
                ref='multipleTable', 
                :data="list"
                style='width: 100%', 
                @selection-change="handleSelectionChange"
                @sort-change="sortChange"
            )
                el-table-column(type='selection')
                el-table-column( sortable="custom", property='creationDate' label='Fecha de Creación' label-class-name="labelForDate")
                    template(slot-scope='scope') {{ scope.row.creationDate }}
                el-table-column( align="scope", sortable="custom" property='name', label='Nombre del alumno')
                el-table-column( align="scope", sortable="custom" property='email', label='Correo')
                el-table-column( align="scope", property='career', label='Carrera')
                el-table-column( align="center", sortable="custom" property='status', label='Estado')
                    template(slot-scope='scope') 
                        div.state__course( v-bind:class="{ 'active' : scope.row.status == 1}" )
                el-table-column( align="center", sortable="custom" property='isEmailValidate', label='Validado')
                    template(slot-scope='scope') {{ scope.row.isEmailValidate == true ? 'Si' : 'No' }}
                el-table-column( align="center")
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail(@click="goToDetailStudent(scope.row.idStudent)" size="mini" round) VER DETALLE
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
            h3 {{ notData }}
        confirmModal(ref="confirmModal" @save="sendData")
</template>

<script>
import pagination from "~/components/shared/pagination";
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
import { termStatus, sort } from "~/enums";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  components: {
    pagination,
    confirmModal
  },
  head: {
    title: "Alumnos"
  },
  async fetch({ store, params, query }) {
    let page = query.page ? Number(query.page) : 1;
    try {
      store.commit("students/setPagination", page);
      query.term
        ? store.commit("students/setTerm", query.term)
        : store.commit("students/setTerm", termStatus.NEGATIVE);
      store.commit("students/setSortList", {
        sortName: "sortDate",
        isAscending: sort.ASC
      });
      await store.dispatch("students/getList", params.university);
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      notData: "No hay ningun alumno registrado",
      openSearch: false,
      search: null,
      removeOverlay: false,
      showPagination: true,
      counterSelec: "",
      showAbleDisable: false,
      statusStudent: "",
      idStudentsSelect: [],
      isActive: ""
    };
  },
  methods: {
    openSearchModal() {
      this.openSearch = true;
      this.removeOverlay = true;
      this.search = "";
      this.$nextTick(() => this.$refs.searchInput.$el.children[0].focus());
    },
    closeSearch() {
      this.openSearch = false;
      this.removeOverlay = false;
      this.resetList();
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/students`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });
      this.$refs.multipleTable.clearSort();
    },
    async pagination(val) {
      this.$store.commit("students/setPagination", val);
      await this.$store.dispatch(
        "students/getList",
        this.$route.params.university
      );
      this.$router.push({
        query: { page: val }
      });
    },
    action(val) {
      this.statusStudent = val == "inactive" ? "desactivar" : "activar";
      this.$refs.confirmModal.open(
        "icon-ic-alumno",
        `¿Estás seguro que deseas ${this.statusStudent} ${this.counterSelec}?`
      );
    },
    closeModal() {
      this.$refs.confirmModal ? this.$refs.confirmModal.close() : "";
    },
    goToDetailStudent(val) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      let term = this.search ? this.search : "";
      this.$router.push({
        path: `students/detail`,
        query: {
          id: val,
          page: page,
          term: term
        }
      });
    },
    handleSelectionChange(val) {
      this.idStudentsSelect = val.map(i => i.idStudent);
      this.counterSelec = val.length > 1 ? "estos alumnos" : "este alumno";
      this.showAbleDisable = val.length >= 1 ? true : false;
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("students/setTerm", termStatus.NEGATIVE);
      this.$store.commit("students/setPagination", page);
      await this.$store.dispatch(
        "students/getList",
        this.$route.params.university
      );
    },
    async sortChange(val) {
      let isAscending = val.order == "ascending" ? sort.ASC : sort.DESC;
      let sortName;
      console.log(val);
      switch (val.prop) {
        case "creationDate":
          sortName = "sortDate";
          break;
        case "name":
          sortName = "sortName";
          break;
        case "email":
          sortName = "sortEmail";
          break;
        case "status":
          sortName = "sortStatus";
          break;
        case "isEmailValidate":
          sortName = "sortValidate";
          break;
        default:
          return;
      }
      this.$store.commit("students/setSortList", {
        sortName,
        isAscending
      });
      await this.$store.dispatch(
        "students/getList",
        this.$route.params.university
      );
    },
    async sendData() {
      let status = this.statusStudent == "activar" ? 1 : 2;
      try {
        await this.$store.dispatch("students/updateStatus", {
          idStudents: this.idStudentsSelect,
          status: status
        });

        await this.$store.dispatch(
          "students/getList",
          this.$route.params.university
        );
      } catch (error) {
        this.$store.dispatch("catchError", error);
      }
      this.$refs.confirmModal.close();
    },
    changeDropdown(val) {
      this.isActive = val == true ? val : false;
    }
  },
  computed: {
    ...mapState({
      list: state => state.students.list,
      pageSize: state => state.students.limit,
      pageCount: state => state.students.totalPage,
      total: state => state.students.totalStudents,
      currentPage: state => state.students.page
    })
  },
  watch: {
    list(val) {
      if (val.length == 0) {
        this.notData = "No se encontraron resultados";
      }
    },
    async search(val) {
      const arr = val.split("");
      arr.map((value, index) => {
        if (value == "|") {
          arr.splice(index, 1);
        }
      });
      const texto = arr.join("");
      //console.log(texto);
      const search = texto;

      if (val.length >= 3) {
        this.$store.commit("students/setTerm", val);
        this.$store.commit("students/setPagination", 1);
        await this.$store.dispatch(
          "students/getList",
          this.$route.params.university
        );
        this.removeOverlay = false;
        this.$router.push({
          query: {
            page: this.$route.query.page,
            term: this.search
          }
        });
      } else if (val == "") {
        this.resetList();
        this.removeOverlay = true;
      }
    },
    pageCount(val) {
      if (val <= 1) {
        this.showPagination = false;
      } else {
        this.showPagination = true;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.searchKeypressValidation();
      if (this.$route.query.term) {
        this.openSearchModal();
        this.search = this.$route.query.term || "";
      }

      document.body.addEventListener("keyup", e => {
        if (e.keyCode == 27) this.closeSearch();
        this.closeModal();
      });
    });
  },
  beforeDestroy() {
    document.body.removeEventListener("keyup", e => {
      if (e.keyCode == 27) this.closeModal();
    });
  }
};
</script>
<style lang="sass">
    .page__students
        .labelForDate
            width: 80px !important
            line-height: 15px
            white-space: initial !important
            .caret-wrapper
                position: absolute
                top: 0px
</style>
