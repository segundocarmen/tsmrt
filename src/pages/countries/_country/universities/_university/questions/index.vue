<template lang="pug">
    .questions(v-bind:class=" {'search__transition': openSearch} ")
        input(ref="fileExcel" type="file" style="display: none" accept=".xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" v-on:change="handleFile")
        .head-box
            h2.title Preguntas
            div.action__btns
                div.search__box
                  i(@click="openSearchModal()").search.icon-ic-search-normal
                div.options__btn
                    el-dropdown(dropdown trigger="click" @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive } ").courses__dropdown 
                        i.icon-ic-options-normal
                        el-dropdown-menu(slot='dropdown').dropdown--options
                            el-dropdown-item(@click.native="openExcelFile")
                                i.icon-ic-carga-masiva-normal
                                |   CARGA MASIVA
                            el-dropdown-item(@click.native="openModalDelete()")
                                i.icon-ic-descarga-plantilla-normal
                                |   DESCARGAR PLANTILLAS
                            el-dropdown-item(@click.native="openModalDelete()" :class="{ 'hidden': !showDeleteOption }")
                                i.icon-ic-erase
                                |   ELIMINAR PREGUNTAS
                .options__close
                    el-input.search__input-box(  v-on:keydown.native="keypressSearch" ref="searchInput" autofocus placeholder="Escribe el nombre de la pregunta" v-model.trim="search" max-length="50")
                        i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")
        
        div(v-bind:class="{ 'disable__table' : removeOverlay }" v-if="list != 0")      
            el-table.general__table(
                ref="table"
                :data="list"
                style="100%"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
                @filter-change="filterChange"
            )         
                el-table-column(type="selection")
                el-table-column(sortable="custom" property="name" label="Pregunta" min-width="200")
                el-table-column(
                    align="scope"
                    sortable="custom" 
                    property="level" 
                    label="Nivel"
                    :filters="filters",
                    :filter-method="filterTag",
                    filter-placement="bottom-end"
                )
                el-table-column( align="center")
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail(@click="goToDetail(scope.row.id)" size="mini" round) VER DETALLE
                
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

        confirmModal(ref="confirmModal" @save="deleteQuestion")
</template>

<script>
import pagination from "~/components/shared/pagination";
import { mapState } from "vuex";
import { eventBus } from "~/event-bus";
import { status, termStatus, internType, sort } from "~/enums";
import confirmModal from "~/components/modals/general";
import { searchKeypressValidation } from "~/mixins";
import XLSX from "xlsx";

export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  head: {
    title: "Preguntas"
  },
  components: {
    pagination,
    confirmModal
  },
  async fetch({ store, params, query }) {
    let page = query.page ? Number(query.page) : 1;
    try {
      store.commit("questions/setPagination", page);
      query.term
        ? store.commit("questions/setTerm", query.term)
        : store.commit("questions/setTerm", termStatus.NEGATIVE);
      store.commit("questions/setSortList", {
        sortName: "sortLevel",
        isAscending: sort.ASC
      });
      await store.commit("questions/setStatus", "1,2,3,4,5,6,7,8,9,10");
      await store.dispatch("questions/getList", params.university);
    } catch (error) {
      //console.log(error);
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      notData: "No hay ninguna pregunta registrada",
      multipleSelection: [],
      isActive: false,
      showDeleteOption: false,
      search: "",
      openSearch: false,
      removeOverlay: false,
      showPagination: false,
      status: false,
      levelFilter: [],
      dataExcel: []
    };
  },
  methods: {
    async sendDataQuestion(data) {
      this.dataExcel=data;
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("questions/setTerm", termStatus.NEGATIVE);
      this.$store.commit("questions/setPagination", page);
      await this.$store.dispatch("questions/saveQuestions", data);
      await this.$store.dispatch("questions/getList", this.$route.params.university );
    },
    handleFile(oEvent) {
      const sendData = this.sendDataQuestion;
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
          var preguntas = [];
          oJS.map((item, index) => {
            var result = Object.keys(item).map(function(key) {
              return [item[key]];
            });

            console.log(result);
            var objQuestion = new Object();
            objQuestion.idCollege = idCollege;
            objQuestion.question = item.pregunta;
            objQuestion.level = Number(item.nivel);
            var answers = [];
            answers.push(
              { asnwerDescription: item.respuesta_1 },
              { asnwerDescription: item.respuesta_2 },
              { asnwerDescription: item.respuesta_3 },
              { asnwerDescription: item.respuesta_4 }
            );
            objQuestion.answers = answers;
            preguntas.push(objQuestion);
          });
          var data = { questions: preguntas };
          sendData(data);
        });
      };

      // Tell JS To Start Reading The File.. You could delay this if desired
      reader.readAsBinaryString(oFile);
    },
    keypressSearch(event) {      

    },
    openSearchModal() {
      this.openSearch = true;
      this.removeOverlay = true;
      this.search = "";
      this.$nextTick(() => this.$refs.searchInput.$el.children[0].focus() );
    },
    closeSearch() {
      this.openSearch = false;
      this.removeOverlay = false;
      this.resetList();
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${this.$route.params.university}/questions`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });      
      if(this.$refs.table) {
        this.$refs.table.clearSort();
      }
      //var currentPage = this.$store.state.questions.page;
      this.$store.commit("questions/setPagination", 1);
    },
    async pagination(val) {
      this.$store.commit("questions/setPagination", val);
      await this.$store.dispatch(
        "questions/getList",
        this.$route.params.university
      );
      this.$router.push({
        query: { page: val }
      });
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("questions/setTerm", termStatus.NEGATIVE);
      this.$store.commit("questions/setPagination", page);
      await this.$store.dispatch(
        "questions/getList",
        this.$route.params.university
      );
    },
    add() {
      let params = this.$route.params;
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${params.country}/universities/${params.university}/questions/new`,
        query: {
          page: page,
          type: internType.NEW,
          term: this.search
        }
      });
    },
    openModalDelete() {
      let messageVariable = "";

      if (this.$refs.table.selection.length > 1)
        messageVariable = `Estás ${this.counter} preguntas?`;
      else messageVariable = `esta pregunta`;

      this.$refs.confirmModal.open(
        "icon-ic-erase",
        `¿Estás seguro que deseas eliminar ${messageVariable}?`
      );
    },
    openExcelFile() {
      //this.$refs.fileExcel.$el.click();
      this.$refs.fileExcel.click();
    },
    changeDropdown() {},
    async deleteQuestion() {
      try {
        await this.$store.dispatch("questions/delete", this.multipleSelection);
        await this.$store.dispatch(
          "questions/getList",
          this.$route.params.university
        );
      } catch (error) {
        //console.log(error);
        this.$store.dispatch("catchError", error);
      }
      this.$refs.confirmModal.close();
    },
    async sortChange(val) {
      let isAscending =
        val.order == "ascending"
          ? sort.ASC
          : val.order == "descending"
          ? sort.DESC
          : sort.DESC;

      let sortName;

      switch (val.prop) {
        case "name":
          sortName = "sortQuestion";
          break;
        case "level":
          sortName = "sortLevel";
          break;
        default:
          sortName = "sortLevel";
          break;
          return;
      }
      this.$store.commit("questions/setSortList", {
        sortName,
        isAscending
      });
      await this.$store.dispatch(
        "questions/getList",
        this.$route.params.university
      );
    },
    async filterChange(filters) {
      //console.log(filters);
      var filtros = filters[Object.keys(filters)];
      if (filtros.length > 0) {
        var selectedFiltes = filtros.join();
      } else {
        var selectedFiltes = "1,2,3,4,5,6,7,8,9,0";
      }
      await this.$store.commit("questions/setStatus", selectedFiltes);
      await this.$store.dispatch(
        "questions/getList",
        this.$route.params.university
      );
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.id);
      this.counter = val.length;
      this.showDeleteOption = Boolean(val.length);
    },
    goToDetail(id, type) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: "questions/detail",
        query: {
          id: id,
          type: internType.EDIT,
          page: page,
          term: this.$route.query.term
        }
      });
    },
    filterTag(value, row) {
      return row.level === value;
    },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    }
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
      const searchText = texto;

      if (val.length >= 3) {
        this.$store.commit("questions/setTerm", val);
        this.$store.commit("questions/setPagination", 1);
        //this.$store.commit("questions/setPagination", 1);
        await this.$store.dispatch(
          "questions/getList",
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
      if (val < 1) {
        this.showPagination = false;
      } else {
        this.showPagination = true;
      }
    }
  },
  computed: {
    ...mapState({
      list: state => state.questions.list || [],
      pageSize: state => state.questions.limit,
      pageCount: state => state.questions.totalPage,
      total: state => state.questions.totalQuestions,
      currentPage: state => state.questions.page
    }),
    filters() {
      return [
        { text: "01", value: 1 },
        { text: "02", value: 2 },
        { text: "03", value: 3 },
        { text: "04", value: 4 },
        { text: "05", value: 5 },
        { text: "06", value: 6 },
        { text: "07", value: 7 },
        { text: "08", value: 8 },
        { text: "09", value: 9 },
        { text: "10", value: 10 }
      ];
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.searchKeypressValidation();
      if (this.$route.query.term) {
        this.openSearchModal();
        this.search = this.$route.query.term || "";
      }

      /* document.body.addEventListener("keyup", e => {
        if (e.keyCode == 27) this.openSearchModal();
      }); */
      this.searchKeypressValidation();
      if (this.$route.query.term) {
        this.openSearchModal();
        this.search = this.$route.query.term || "";
      }
    });
  },
  created() {
    this.showPagination = this.pageCount >= 1;
  }
};
</script>

<style lang="sass">
    .questions 
        .head-box
            margin-bottom: 15px
            position: relative
            z-index: 10
        .el-table
            .el-table__body
                td 
                    height: 51px
</style>
