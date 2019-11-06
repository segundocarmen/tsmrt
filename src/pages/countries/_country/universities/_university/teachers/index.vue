<template lang="pug">
    div(v-bind:class=" {'search__transition': openSearch} ")
        div.courses
            input(ref="fileExcel" type="file" style="display: none" accept=".xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" v-on:change="handleFile")
            .head-box
                h1.title Profesores
                div.action__btns
                    div.search__box
                        i(@click="openSearchModal()").search.icon-ic-search-normal
                    div.options__btn
                        i(@click="addTeacher()").add.icon-ic-add-normal
                        el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive} ").courses__dropdown 
                            i.icon-ic-options-normal
                            el-dropdown-menu(slot='dropdown').dropdown--options
                                el-dropdown-item(@click.native="openExcelFile")
                                    i.icon-ic-carga-masiva-normal
                                    | CARGA MASIVA
                                el-dropdown-item(divided)
                                    i.icon-ic-descarga-plantilla-normal
                                    | DESCARGAR PLANTILLA
                                el-dropdown-item(divided @click.native="openModalStatus(true)" :class="{'hidden' : !counter}")
                                    i.icon-ic-activar
                                    | ACTIVAR PROFESOR
                                el-dropdown-item(divided @click.native="openModalStatus(false)" :class="{'hidden' : !counter}")
                                    i.icon-ic-desactivar
                                    | DESACTIVAR PROFESOR
                    .options__close
                        el-input.search__input-box(ref="searchInput" autofocus placeholder="Escribe el nombre, apellido o código del profesor" v-model.trim="search" maxlength="50")
                            i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")

        //- el-upload.upload-demo(ref='upload', action='https://jsonplaceholder.typicode.com/posts/', :auto-upload='false')
        //-     el-button(slot='trigger', size='small', type='primary') Selecciona un archivo
        //-     el-button(style='margin-left: 10px;', size='small', type='success', @click='submitUpload') Cargar al servidor
        //-     .el-upload__tip(slot='tip') Solo archivos jpg/png con un tamaño menor de 500kb

        div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="list != 0")
            el-table.general__table(
                ref="table"
                :data="list"
                style="100%"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
            )
                el-table-column(type='selection')
                el-table-column( sortable="custom", property='code' label='Código')
                el-table-column( sortable="custom" property='name', label='Nombre de profesor')
                el-table-column( align="center", property='email', label='Correo', show-overflow-tooltip='')
                el-table-column( align="center", sortable="custom", property='status', label='Estado', show-overflow-tooltip='' )
                    template(slot-scope='scope') 
                        div.state__course( v-bind:class="{ 'active' : scope.row.status }" )
                el-table-column( align="center", property='associatedCourses', label='Cursos asociados', show-overflow-tooltip='')
                el-table-column( align="center")
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail(@click="goToDetail(scope.row.idTeacher)" size="mini" round) VER DETALLE

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
            
        confirmModal(ref="confirmModal" @save="updateStatus")

</template>
<script>
import pagination from "~/components/shared/pagination";
import { mapState } from "vuex";
import { eventBus } from "~/event-bus";
import { status, termStatus, sort } from "~/enums";
import confirmModal from "~/components/modals/general";
import { searchKeypressValidation } from "~/mixins";
import Papa from "papaparse";

export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  head: {
    title: "Profesores"
  },
  async fetch({ store, params, query }) {
    let page = Number(query.page) || 1;
    try {
      store.commit("teacher/setPagination", page);
      query.term
        ? store.commit("teacher/setTerm", query.term)
        : store.commit("teacher/setTerm", termStatus.NEGATIVE);
      store.commit("teacher/setSort", {
        sortName: "sortName",
        isAscending: sort.ASC
      });
      await store.dispatch("teacher/findTeachers", params.university);
    } catch (error) {
      console.log("error Teacher");
      store.dispatch("catchError", error);
    }
  },
  components: {
    pagination,
    confirmModal
  },
  data() {
    return {
      notData: "No hay ningun profesor ingresado",
      multipleSelection: [],
      openSearch: false,
      search: "",
      removeOverlay: false,
      showPagination: "",
      multipleSelection: "",
      status: false,
      isActive: "",
      dataExcel: [],
    };
  },
  methods: {
    submitUpload() {
      this.$refs.upload.submit();
    },
    openSearchModal() {
      this.openSearch = true;
      this.removeOverlay = true;
      this.search = "";
      this.$nextTick(() => this.$refs.searchInput.$el.children[0].focus());
    },
    async closeSearch() {
      this.openSearch = false;
      this.removeOverlay = false;
      this.resetList();
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/teachers`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });
      this.$refs.table.clearSort();
    },
    addTeacher() {
      let params = this.$route.params;
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${params.country}/universities/${
          params.university
        }/teachers/new`,
        query: {
          page: page
        },
        meta: { title: "Nuevo profesor" }
      });
    },
    async sendDataTeacher(data) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("teacher/setTerm", termStatus.NEGATIVE);
      this.$store.commit("teacher/setPagination", page);
      this.dataExcel=data.teacher;
      await this.$store.dispatch("teacher/saveTeachers", data);
      await this.$store.dispatch("teacher/findTeachers", this.idCollege.university);
    },
    handleFile(oEvent) {
      const sendData = this.sendDataTeacher;
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
          var listTeachers = [];
          oJS.map((item, index) => {
            var objTeacher = new Object();

            //objTeacher.idCollege = idCollege;
            objTeacher.code = item['Codigo'];
            objTeacher.name = item['Nombre'] + ' ' + item['Apellido'];
            objTeacher.firstName = item['Nombre'];
            objTeacher.lastName = item['Apellido'];
            objTeacher.email = item['Correo'];
            objTeacher.gender = item['Género'];
            objTeacher.url = item['URL'] || '';

            listTeachers.push(objTeacher);
          });
          var data = { idCollege, teachers: listTeachers };
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
    async pagination(val) {
      this.$store.commit("teacher/setPagination", val);
      await this.$store.dispatch(
        "teacher/findTeachers",
        this.idCollege.university
      );
      this.$router.push({
        query: { page: val }
      });
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("teacher/setTerm", termStatus.NEGATIVE);
      this.$store.commit("teacher/setPagination", page);
      await this.$store.dispatch(
        "teacher/findTeachers",
        this.idCollege.university
      );
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
          case "status":
            sortName = "sortStatus";
            break;
          default:
            return;
        }

        await this.$store.commit("teacher/setSort", { sortName, isAscending });
        await this.$store.dispatch(
          "teacher/findTeachers",
          this.idCollege.university
        );
        this.$refs.table.clearSort();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    openModalStatus(isActive) {
      let modalMessage = "";
      let messageVariable = "";
      this.status = isActive;
      // console.log(this.$refs.table !== undefined)

      if (this.$refs.table.selection.length > 1)
        messageVariable = `estos ${this.counter} profesores?`;
      else messageVariable = `este profesor`;

      if (isActive)
        modalMessage = `¿Estás seguro que deseas activar ${messageVariable}`;
      else
        modalMessage = `¿Estás seguro que deseas desactivar ${messageVariable}`;

      this.$refs.confirmModal.open("icon-ic-teacher", modalMessage);
    },
    async updateStatus() {
      try {
        await this.$store.dispatch("teacher/updateStatus", {
          idTeachers: this.idsSelected,
          status: this.status ? status.ACTIVE : status.INACTIVE
        });
        await this.$store.dispatch(
          "teacher/findTeachers",
          this.idCollege.university
        );
      } catch (error) {
        if (error.code !== 409) this.$catchError(error);
        else this.errorMessage = error.message;
      }
      this.$refs.confirmModal.close();
    },
    async goToDetail(val) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `teachers/detail`,
        query: {
          id: val,
          page: page,
          term: this.$route.query.term
        }
      });
    },
    changeDropdown(val) {
      this.isActive = val == true ? val : false;
    }
  },
  computed: {
    ...mapState({
      list: state => state.teacher.list || [],
      pageSize: state => state.teacher.limit,
      pageCount: state => state.teacher.totalPage,
      total: state => state.teacher.totalCourses,
      currentPage: state => state.teacher.page
    }),
    counter() {
      return this.multipleSelection.length;
    },
    idsSelected() {
      return this.multipleSelection
        ? this.multipleSelection.map(item => item.idTeacher)
        : [];
    }
  },
  watch: {
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
        this.$store.commit("teacher/setTerm", val);
        this.$store.commit("teacher/setPagination", 1);
        await this.$store.dispatch(
          "teacher/findTeachers",
          this.idCollege.university
        );
        this.removeOverlay = false;
        this.$router.push({
          query: {
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
      if (this.$store.state.teacher.totalPage <= 1) {
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
  created() {
    eventBus.$on("save", () => {
      console.log("Save Change");
      setTimeout(() => {
        eventBus.$emit("closeConfirm");
      }, 500);
    });
  }
};
</script>
