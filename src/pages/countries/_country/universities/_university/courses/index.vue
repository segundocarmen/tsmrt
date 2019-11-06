<template lang="pug">
    div(v-bind:class=" {'search__transition': openSearch} ")
        div.courses
            input(ref="fileExcel" type="file" style="display: none" accept=".xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" v-on:change="handleFile")
            .head-box
                h1.title Cursos
                div.action__btns
                    div.search__box
                        i(@click="openSearchModal()").search.icon-ic-search-normal
                    div.options__btn
                        i(@click="addCourse()").add.icon-ic-add-normal
                        el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive} ").courses__dropdown 
                            i.icon-ic-options-normal
                            el-dropdown-menu(slot='dropdown').dropdown--options
                                el-dropdown-item(@click.native="openExcelFile")
                                    i.icon-ic-carga-masiva-normal
                                    | Carga Masiva
                                el-dropdown-item(divided)
                                    i.icon-ic-descarga-plantilla-normal
                                    | Descargar plantilla
                                el-dropdown-item(divided @click.native="openModalStatus(true)" :class="{'hidden' : !counter}")
                                    i.icon-ic-activar
                                    | ACTIVAR CURSO
                                el-dropdown-item(divided @click.native="openModalStatus(false)" :class="{'hidden' : !counter}")
                                    i.icon-ic-desactivar
                                    | DESACTIVAR CURSO
                    .options__close
                        el-input.search__input-box(ref="searchInput" autofocus placeholder="Escribe el nombre o abreviatura de la universidad" v-model.trim="search" maxlength="50")
                            i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")


        div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="list != 0")
            el-table.general__table(
                ref='multipleTable', 
                :data="list"
                style='width: 100%', 
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
            )
                el-table-column(type='selection')
                el-table-column( sortable="custom", property='code' label='Código')
                    template(slot-scope='scope') {{ scope.row.code }}
                el-table-column( sortable="custom" property='name', label='Nombre de curso')
                el-table-column( align="center", sortable="custom", property='status', label='Estado', show-overflow-tooltip='' )
                    template(slot-scope='scope') 
                        div.state__course( v-bind:class="{ 'active' : scope.row.status }" )
                el-table-column( align="center", property='countCareer', label='Carreras asociadas', show-overflow-tooltip='')
                el-table-column( align="center", property='countTeacher', label='Profesores asociados', show-overflow-tooltip='')
                el-table-column( align="center")
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail(@click="goToDetailCourse(scope.row._id)" size="mini" round) VER DETALLE

            pagination.course__pagination(
                v-if="showPagination"
                :currentPage="Number(currentPage)"
                :pageSize="pageSize"
                :pageCount="pageCount"
                layout="prev, pager, next, jumper"
                :total="total"
                @currentPage="pagination"
            )
        div.message__no-data(v-else)
            h3 {{ notData }}
            
        confirmModal(ref="confirmModal" @save="updateStatus")
</template>
<script>
import pagination from "~/components/shared/pagination";
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
import { termStatus, sort, awardStatus } from "~/enums";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  components: {
    pagination,
    confirmModal
  },
  head: {
    title: "Cursos"
  },
  //setea valores por defecto ni bien carga la página
  //y mantiene la paginación, el buscador
  async fetch({ store, params, query }) {
    try {
      let page = Number(query.page) || 1;
      if (params.university) store.commit("course/setPagination", page);
      //si se esta haciendo una busqueda, en la url queda el termino buscado aun cuando se recarga la pagina
      query.term
        ? store.commit("course/setTerm", query.term)
        : store.commit("course/setTerm", termStatus.NEGATIVE);
      store.commit("course/setSort", {
        sortName: "sortName",
        isAscending: sort.ASC
      });
      await store.dispatch("course/findCourses", params.university);
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      notData: "No hay ningun curso ingresado",
      multipleSelection: [],
      openSearch: false,
      search: "",
      removeOverlay: false,
      showPagination: "",
      idCollege: "",
      conditional: "",
      showOption: false,
      isActive: "",
      status: false
    };
  },
  methods: {
    async sendDataCourse(data) {
      this.dataExcel=data.cource;
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("course/setTerm", -1);
      this.$store.commit("course/setPagination", page);
      await this.$store.dispatch("course/saveCources", data);
      await this.$store.dispatch("course/findCourses", this.idCollege.university);
    },
    handleFile(oEvent) {
      const sendData = this.sendDataCourse;
      var idCollege = this.$route.params.university;
      // Get The File From The Input
      var oFile = oEvent.target.files[0]; 
      //var sFilename = oFile.name; //name archivo
      // Create A File Reader HTML5
      var reader = new FileReader();

      // Ready The Event For When A File Gets Selected
      reader.onload = function(e) {
        var data = e.target.result;
        var cfb = XLS.CFB.read(data, { type: "binary" });
        var wb = XLS.parse_xlscfb(cfb);
        // Loop Over Each Sheet
        wb.SheetNames.forEach(async function(sheetName) {
          // Obtain The Current Row As CSV
          //var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);
          var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
          //console.log(sCSV);
          var listCources = [];
          oJS.map((item, index) => {
            var objTeacher = new Object();
            //objTeacher.idCollege = idCollege;
            objTeacher.code = item['Código'];
            objTeacher.name = item['Nombre'];
            listCources.push(objTeacher);
          });
          var data = { idCollege, courses: listCources };
          sendData(data);
        });
      };

      // Tell JS To Start Reading The File.. You could delay this if desired
      reader.readAsBinaryString(oFile);
    },
    openExcelFile() {
      //this.$refs.fileExcel.$el.click();
      this.$refs.fileExcel.click();
    },
    openSearchModal() {
      this.openSearch = true;
      this.removeOverlay = true;
      this.search = "";
      this.$nextTick(() => this.$refs.searchInput.$el.children[0].focus());
    },
    addCourse() {
      let params = this.$route.params;
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${params.country}/universities/${
          params.university
        }/courses/new`,
        query: {
          page: page
        }
      });
    },
    async closeSearch() {
      this.openSearch = false;
      this.removeOverlay = false;
      this.resetList();
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/courses`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });
      this.$refs.multipleTable.clearSort();
    },
    searching() {},
    async goToDetailCourse(val) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `courses/detail`,
        query: {
          id: val,
          page: page,
          term: this.$route.query.term
        }
      });
    },
    async pagination(val) {
      this.$store.commit("course/setPagination", val); //setea la paginación y trae una nueva lista
      await this.$store.dispatch(
        "course/findCourses",
        this.idCollege.university
      );
      this.$router.push({
        query: { page: val }
      });
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("course/setTerm", -1);
      this.$store.commit("course/setPagination", page);
      await this.$store.dispatch(
        "course/findCourses",
        this.idCollege.university
      );
      // this.$router.push({
      //     query: { term : this.$route.query.term || -1}
      // })
    },
    async sortChange(val) {
      if (this.idCollege && this.idCollege.university) {
        let isAscending = val.order == "ascending" ? sort.ASC : sort.DESC;
        let sortName;

        switch (val.prop) {
          case "code":
            sortName = "sortCode";
            break;
          case "name":
            sortName = "sortName";
            break;
          default:
            sortName = "sortStatus";
        }

        await this.$store.commit("course/setSort", { sortName, isAscending });
        await this.$store.dispatch(
          "course/findCourses",
          this.idCollege.university
        );
      }
    },
    changeDropdown(val) {
      this.isActive = val == true ? val : false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    openModalStatus(isActive) {
      let modalMessage = "";
      let messageVariable = "";
      this.status = isActive;
      // console.log(this.$refs.table !== undefined)

      if (this.$refs.multipleTable.selection.length > 1)
        messageVariable = `estos ${this.counter} cursos?`;
      else messageVariable = `este curso`;

      if (isActive)
        modalMessage = `¿Estás seguro que deseas activar ${messageVariable}`;
      else
        modalMessage = `¿Estás seguro que deseas desactivar ${messageVariable}`;

      this.$refs.confirmModal.open("icon-ic-teacher", modalMessage);
    },
    async updateStatus() {
      try {
        let idCourses = this.multipleSelection.map(item => item._id);
        await this.$store.dispatch("course/activeInactiveCourse", {
          idCourses,
          status: this.status ? awardStatus.ACTIVE : awardStatus.INACTIVE
        });
        await this.$store.dispatch(
          "course/findCourses",
          this.$route.params.university
        );
      } catch (error) {
        console.log(error);
      }
      this.$refs.confirmModal.close();
    }
  },
  computed: {
    ...mapState({
      list: state => state.course.courses || [],
      pageSize: state => state.course.limit,
      pageCount: state => state.course.totalPage,
      total: state => state.course.totalCourses,
      currentPage: state => state.course.page
    }),
    counter() {
      return this.multipleSelection.length;
    }
  },
  watch: {
    async search(val) {
      if (val.length >= 3) {
        this.$store.commit("course/setTerm", val);
        this.$store.commit("course/setPagination", 1);
        await this.$store.dispatch(
          "course/findCourses",
          this.idCollege.university
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
    list(val) {
      if (val.length == 0) {
        this.notData = "No se encontraron resultados";
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
      if (this.$store.state.course.totalPage <= 1) {
        this.showPagination = false;
      } else {
        this.showPagination = true;
      }
      this.idCollege = this.$route.params;

      document.body.addEventListener("keyup", e => {
        if (e.keyCode == 27) this.closeSearch();
      });

      this.searchKeypressValidation();
      if (this.$route.query.term) {
        this.openSearchModal();
        this.search = this.$route.query.term || "";
      }
    });
  },
  async created() {
    await this.$store.commit("course/setTerm", termStatus.NEGATIVE);
    // this.search = this.$route.query.term || ''
  }
};
</script>

<style lang="sass">
    
</style>
