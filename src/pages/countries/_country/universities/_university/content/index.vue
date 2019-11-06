<template lang="pug">
    .content__style(v-bind:class=" {'search__transition': openSearch} ")
        .head-box
            h4.title Contenido
            div.action__btns__students
                div.search__box
                    i(@click="openSearchModal()").search.icon-ic-search-normal
                div.options__btn(v-if="isSelect")
                    el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive} ").courses__dropdown
                        i.icon-ic-options-normal
                        el-dropdown-menu(slot='dropdown')
                            el-dropdown-item(@click.native="blockContent")
                                i.icon-ic-desactivar
                                | BLOQUEAR CONTENIDO
                .options__close
                    el-input.search__input-box(ref="searchInput" autofocus placeholder="Buscar por título" v-model.trim="search" maxlength="50")
                        i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")
        el-tabs(type="card" v-model="activeName" @tab-click="handleClick",ref="tabsContent").mt-28.tab__style.tab--document
            el-tab-pane(label="Contenido")
                div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="list != 0")
                    el-table.general__table(
                        ref='multipleTable', 
                        :data="list"
                        style='width: 100%', 
                        @selection-change="handleSelectionChange"
                        @sort-change="sortChange"
                        @filter-change="filterChange"
                    )
                        el-table-column(type='selection')
                        el-table-column(align="scope", sortable="custom" property='title', label='Título')
                        el-table-column(sortable="custom", property='course' label='Curso')
                            template(slot-scope='scope') {{ scope.row.course }}
                        el-table-column(align="scope", sortable="custom" property='student', label='Alumno')
                        el-table-column(align="center", 
                            property='status', 
                            label='Estado',
                            :filters="filters",
                            :filter-method="filterTag",
                            filter-placement="bottom-end"
                        )
                            template(slot-scope='scope')
                                div.status-circle(:class="getStatusClass(scope.row.status)").d-inline-block.mr-8
                                span(v-if="scope.row.status == spamStatus.ACTIVE") Activo
                                span(v-else) Inactivo
                        el-table-column(align="center", sortable="custom" property='countDislike', label='Me gusta')
                        el-table-column(align="center", sortable="custom" property='countLike', label='No me gusta')
                        el-table-column( align="center" property="urls")
                            template(slot-scope='scope')
                                i.icon-normal.remove__border(@click="showVisorDocs({ urls: scope.row.urls, typeFile: scope.row.typeFile })")
                                el-button.blue__button.view-detail(@click="goToDetail({ id: scope.row.idDocument, type: 1 })" size="mini" round) VER DETALLE
                    pagination.course__pagination(
                        v-if="showPagination"
                        :currentPage="Number(currentPage)"
                        :pageSize="pageSize"
                        :pageCount="pageCount"
                        layout="prev, pager, next, jumper"
                        @currentPage="pagination"
                    )
                div.message__no-data(v-else)
                    h3 No hay contenido subido aún

            el-tab-pane(label="Contenido SPAM")
                div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="listSpam != 0")
                    el-table.general__table(
                        ref='filterTable'
                        :data="listSpam"
                        style='width: 100%'
                        @selection-change="handleSelectionChange"
                        @sort-change="sortChange"
                        @filter-change="filterChangeSpam"
                    )
                        el-table-column(type='selection')
                        el-table-column( align="scope", sortable="custom" property='title', label='Título')
                        el-table-column( align="scope", sortable="custom" property='author', label='Autor')
                        el-table-column( align="center", sortable="custom" property='countReport', label='Reportes')
                        el-table-column( align="scope", 
                            property='status', 
                            prop="status"
                            label='Estado'
                            :filters="filterSpam"
                            :filter-method="filterTagStatus"
                            filter-placement="bottom-end"
                        )
                            template(slot-scope='scope') 
                                div.status-circle(:class="getStatusClass(scope.row.status.value)").d-inline-block.mr-8 
                                | {{scope.row.status.name}}
                        el-table-column( align="right")
                            template(slot-scope='scope')
                                el-button.blue__button.view-detail.mr-4(@click="goToDetail({ id: scope.row.idDocument, type:2 })" size="mini" round) VER DETALLE
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
                    h3 No se encontraron resultados

        visorDocs(ref="visorDocs")
        confirmModal(ref="confirmModal" @save="blockContent")
        el-dialog(
            :visible.sync="dialogVisible"
            width="500px"
            top="0"
            bottom="0"
        )
           
</template>

<script>
import visorDocs from "~/components/shared/visor-docs";
import pagination from "~/components/shared/pagination";
import confirmModal from "~/components/modals/general";
import { spamStatus, termStatus, sort, status } from "~/enums";
import { mapState } from "vuex";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  components: {
    pagination,
    visorDocs,
    confirmModal
  },
  head: {
    title: "Contenido",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*"
  },
  data() {
    return {
      openSearch: false,
      removeOverlay: false,
      search: "",
      isSelect: false,
      showPagination: true,
      counterSelect: 0,
      isActive: "",
      activeName: "0",
      spamStatus,
      urls: [
        "https://i.imgur.com/pj0h7aO.jpg",
        "https://images.designtrends.com/wp-content/uploads/2016/03/30060819/Elegant-Night-Stay-Anime-Background.jpg"
      ],
      dialogVisible: false
    };
  },
  async fetch({ store, params, query }) {
    let page = query.page ? Number(query.page) : 1;
    try {
      store.commit("content/setPagination", page);
      if (store.getters["content/contentActivePage"] == "Contenido") {
        await store.dispatch("content/getList", params.university);
      } else {
        await store.dispatch("content/getListSpam", params.university);
      }
      query.term
        ? store.commit("content/setTerm", query.term)
        : store.commit("content/setTerm", termStatus.NEGATIVE);
      store.commit("content/setSort", {
        sortName: "sortTitle",
        isAscending: sort.ASC
      });
    } catch (error) {
      console.log("content error", error);
      store.dispatch("catchError", error);
    }
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
        }/content`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });
      //this.$refs.table.clearSort();
    },
    async sortChange(val) {
      let isAscending =
        val.order == "ascending"
          ? sort.ASC
          : val.order == "descending"
          ? sort.DESC
          : sort.ASC;
      let sortName;

      if (this.$store.getters["content/contentActivePage"] == "Contenido") {
        switch (val.prop) {
          case "title":
            sortName = "sortTitle";
            break;
          case "course":
            sortName = "sortCourse";
            break;
          case "student":
            sortName = "sortStudent";
            break;
          case "status":
            sortName = "sortStatus";
            break;
          case "countLike":
            sortName = "sortLike";
            break;
          case "countDislike":
            sortName = "sortDislike";
            break;
          default:
            return;
        }
      } else {
        console.log(val.prop);
        switch (val.prop) {
          case "title":
            sortName = "sortTitle";
            break;
          case "author":
            sortName = "sortAuthor";
            break;
          case "countReport":
            sortName = "sortCountReport";
            break;
          default:
            sortName = "sortTitle";
            break;
            return;
        }
      }

      await this.$store.commit("content/setSort", { sortName, isAscending });
      if (this.$store.getters["content/contentActivePage"] == "Contenido") {
        await this.$store.dispatch(
          "content/getList",
          this.$route.params.university
        );
      } else {
        await this.$store.dispatch(
          "content/getListSpam",
          this.$route.params.university
        );
      }
    },
    async filterChange(filters) {
      var filtros = filters[Object.keys(filters)];
      if (filtros.length > 0) {
        var selectedFiltes = filtros.join();
      } else {
        var selectedFiltes = "1,2";
      }
      await this.$store.commit("content/setStatus", selectedFiltes);
      await this.$store.dispatch(
        "content/getList",
        this.$route.params.university
      );
    },
    async filterChangeSpam(filters) {
      var filtros = filters[Object.keys(filters)];
      if (filtros.length > 0) {
        var selectedFiltes = filtros.join();
      } else {
        var selectedFiltes = "3,4,5,6";
      }
      await this.$store.commit("content/setStatusSpam", selectedFiltes);
      await this.$store.dispatch(
        "content/getListSpam",
        this.$route.params.university
      );
    },
    handleSelectionChange(val) {
      this.counterSelect = val.length;
      this.isSelect = val.length >= 1 ? true : false;
    },
    goToDetail({ id, type }) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `content/detail`,
        query: {
          id,
          page,
          type
        }
      });
    },
    blockContent() {
      let counter =
        this.counterSelect == 1
          ? "este contenido"
          : `estos ${this.counterSelect} contenidos`;
      this.$refs.confirmModal.open(
        "icon-ic-desactivar",
        `¿Estás seguro que deseas bloquear ${counter}`
      );
    },
    async pagination(val) {
      this.$store.commit("content/setPagination", val);
      if (this.$store.getters["content/contentActivePage"] == "Contenido") {
        await this.$store.dispatch(
          "content/getList",
          this.$route.params.university
        );
      } else {
        await this.$store.dispatch(
          "content/getListSpam",
          this.$route.params.university
        );
      }
      this.$router.push({
        query: { page: val }
      });
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("content/setTerm", -1);
      this.$store.commit("content/setPagination", page);
      if (this.$store.getters["content/contentActivePage"] == "Contenido") {
        await this.$store.dispatch(
          "content/getList",
          this.$route.params.university
        );
      } else {
        await this.$store.dispatch(
          "content/getListSpam",
          this.$route.params.university
        );
      }
      // this.$router.push({
      //     query: { term : this.$route.query.term || -1}
      // })
    },
    showVisorDocs({ urls, typeFile }) {
      let url = [{ url: urls[0] }];
      this.$refs.visorDocs.open(url, typeFile);
    },
    changeDropdown(val) {
      this.isActive = val == true ? val : false;
    },
    async handleClick(val) {
      this.$router.push({
        path: this.$route.path
      });
      this.$store.commit("content/setActivePage", val.label);
      if (val.label == "Contenido") {
        await this.$store.dispatch(
          "content/getList",
          this.$route.params.university
        );
      } else {
        await this.$store.dispatch(
          "content/getListSpam",
          this.$route.params.university
        );
      }
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
        case spamStatus.INACTIVE:
          return "inactive";
        default:
          return "active";
      }
    },
    filterTag(value, row) {
      return row.status === value;
    },
    filterTagStatus(value, row) {
      return row.status.value === value;
    },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    }
  },
  computed: {
    ...mapState({
      list: state => state.content.list,
      listSpam: state => state.content.listSpam,
      pageSize: state => state.content.limit,
      pageCount: state => state.content.totalPage,
      total: state => state.content.totalContent,
      currentPage: state => state.content.page
    }),
    filters() {
      return [
        { text: "Activo", value: status.ACTIVE },
        { text: "Inactivo", value: status.INACTIVE }
      ];
    },
    filterSpam() {
      return [
        { text: "Cuarentena", value: spamStatus.QUARINTINE },
        { text: "Reportado", value: spamStatus.REPORTED },
        { text: "Bloqueo Automático", value: spamStatus.AUTOMATIC_BLOCK },
        { text: "Bloqueado", value: spamStatus.BLOCKING }
      ];
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
        this.$store.commit("content/setTerm", val);
        this.$store.commit("content/setPagination", 1);
        if (this.$store.getters["content/contentActivePage"] == "Contenido") {
          await this.$store.dispatch(
            "content/getList",
            this.$route.params.university
          );
        } else {
          await this.$store.dispatch(
            "content/getListSpam",
            this.$route.params.university
          );
          await this.$store.commit("content/setPagination", 1);

        }
        this.removeOverlay = false;
        this.$router.push({
          query: {
            //page: this.$route.query.page,
            page: 1,
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
      // if(this.$store.state.content.totalPage <= 1) {
      //     this.showPagination = false

      // } else {
      //     this.showPagination = true
      // }
      document.body.addEventListener("keyup", e => {
        if (e.keyCode == 27) this.closeSearch();
      });
      this.searchKeypressValidation();
      if (this.$route.query.term) {
        this.openSearchModal();
        this.search = this.$route.query.term || "";
      }
    });
  }
};
</script>
<style lang="sass">
    .content__style
        .icon-normal
            font-size: 20px
            color: #7E92A2
            position: relative
            top: 5px
            right: 10px
            cursor: pointer
        .remove__border
            border: none !important
        .message__no-data
            margin-top: 110px
    .tab--document 
        .el-tabs__content
            overflow: initial
</style>

