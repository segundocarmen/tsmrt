<template lang="pug">
    .spam__page(v-bind:class=" {'search__transition': openSearch} ")
        .head-box
            h1.title Comentarios SPAM
            div.action__btns__students
                div.search__box
                    i(@click="openSearchModal()").search.icon-ic-search-normal
                div.options__btn
                    el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive} ")
                        i.icon-ic-options-normal
                        el-dropdown-menu(slot='dropdown').dropdown--options
                            el-dropdown-item(@click.native="action('active')")
                                i.icon-ic-desactivar
                                | BLOQUEAR CONTENIDO
                            el-dropdown-item(divided @click.native="action('inactive')")
                                i.icon-blue
                                | ELIMINAR REPORTES
                .options__close
                    el-input.search__input-box(v-on:keyup.enter="keypressSearch" ref="searchInput" autofocus placeholder="Escribe el nombre" v-model.trim="search" maxlength="50")
                        i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")
        section.mt-10
            el-table.general__table(
                ref='filterTable'
                :data="content"
                style='width: 100%'
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
                @filter-change="filterChange"
            )
                el-table-column(type='selection')
                el-table-column( align="scope", sortable="custom" property='autor', label='Alumno')
                el-table-column( align="scope", sortable="custom" property='title', label='Profesor')
                el-table-column( align="center", sortable="custom" property='reports', label='Reportes')
                el-table-column( align="scope", 
                    property='status', 
                    prop="status"
                    label='Estado'
                    :filters="filters"
                    :filter-method="filterTag"
                    filter-placement="bottom-end"
                )
                    template(slot-scope='scope') 
                        div.status-circle(:class="getStatusClass(scope.row.statusNumber)").d-inline-block.mr-8 
                        | {{scope.row.status}}
                el-table-column( align="right")
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail.mr-4(@click="goToSpam(scope.row.id)" size="mini" round) VER DETALLE
            pagination.course__pagination(
                v-if="showPagination"
                :currentPage="currentPage"
                :pageSize="pageSize"
                :pageCount="pageCount"
                layout="prev, pager, next, jumper"
                :total="total"
                @currentPage="pagination"
            )
</template>

<script>
import pagination from "~/components/shared/pagination";
import { mapState } from "vuex";
import { spamStatus, termStatus, status, internType, sort } from "~/enums";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  components: {
    pagination
  },
  head: {
    title: "No deseados"
  },
  data() {
    return {
      openSearch: false,
      search: "",
      removeOverlay: false,
      showPagination: true,
      tabPosition: 1,
      spamStatus,
      multipleSelection: "",
      isActive: ""
    };
  },
  methods: {
    keypressSearch() {
      console.log(1);
    },
    action(val) {},
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
        }/spam`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });
      this.$refs.filterTable.clearSort();

      //var currentPage = this.$store.state.questions.page;
      this.$store.commit("spam/setPagination", 1);
    },
    changeTab(position) {
      this.tabPosition = position;
    },
    /*
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    sortChange() {},
    */
    async sortChange(val) {
      let isAscending =
        val.order == "ascending"
          ? sort.ASC
          : val.order == "descending"
          ? sort.DESC
          : sort.ASC;

      let sortName;

      switch (val.prop) {
        case "autor":
          sortName = "sortAuthor";
          break;
        case "reports":
          sortName = "sortReports";
          break;
        case "title":
          sortName = "sortTitle";
          break;
        default:
          sortName = "sortTitle";
          break;
          return;
      }
      this.$store.commit("spam/setSortList", {
        sortName,
        isAscending
      });
      await this.$store.dispatch("spam/getList", this.$route.params.university);
    },
    async filterChange(filters) {
      var filtros = filters[Object.keys(filters)];
      if (filtros.length > 0) {
        var selectedFiltes = filtros.join();
      } else {
        var selectedFiltes = "3,4,5,6";
      }
      await this.$store.commit("spam/setStatus", selectedFiltes);
      await this.$store.dispatch("spam/getList", this.$route.params.university);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.id);
      this.counter = val.length;
      this.showDeleteOption = Boolean(val.length);
    },
    goToSpam(id) {
      this.$router.push({
        path: `spam/detail?page=${
          this.$route.query.page != undefined ? this.$route.query.page : 1
        }`,
        query: { id: id }
      });
    },
    pagination() {},
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
        default:
          return "blocking";
      }
    },
    formatter(row, column) {},
    filterTag(value, row) {
      return row.statusNumber === value;
    },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    changeDropdown(val) {
      this.isActive = val == true ? val : false;
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("spam/setTerm", termStatus.NEGATIVE);
      this.$store.commit("spam/setPagination", page);
      await this.$store.dispatch("spam/getList", this.$route.params.university);
    }
  },
  watch: {
    async search(val) {
      if (val.length >= 3) {
        this.$store.commit("spam/setTerm", val);
        this.$store.commit("spam/setPagination", 1);
        await this.$store.dispatch(
          "spam/getList",
          this.$route.params.university
        );
        this.removeOverlay = false;
        this.$router.push({
          query: {
            page:
              this.$route.query.page != undefined ? this.$route.query.page : 1,
            term: this.search
          }
        });
      } else if (val == "") {
        this.resetList();
        this.removeOverlay = true;
      }
    },
    tabPosition(val) {
      console.log("change", val);
    }
  },
  async fetch({ store, params, query }) {
    let page = query.page ? Number(query.page) : 1;
    try {
      store.commit("spam/setPagination", page);
      query.term
        ? store.commit("spam/setTerm", query.term)
        : store.commit("spam/setTerm", termStatus.NEGATIVE);
      store.commit("spam/setSortList", {
        sortName: "sortTitle",
        isAscending: sort.ASC
      });
      await store.dispatch("spam/getList", params.university);
    } catch (error) {
      //console.log(error);
      store.dispatch("catchError", error);
    }
  },
  computed: {
    ...mapState({
      content: state => state.spam.list,
      pageSize: state => state.spam.limit,
      pageCount: state => state.spam.totalPage,
      total: state => state.spam.totalContent,
      currentPage: state => state.spam.page
    }),
    filters() {
      return [
        { text: "Reportado", value: spamStatus.REPORTED },
        { text: "Cuarentena", value: spamStatus.QUARINTINE },
        { text: "Bloqueo Automático", value: spamStatus.AUTOMATIC_BLOCK },
        { text: "Bloqueado", value: spamStatus.BLOCKING }
      ];
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.searchKeypressValidation();
    });
  }
};
</script>

<style lang="sass">
    .spam__page
        .el-tabs__item 
            &.is-active
                border-bottom-color: #F9FBFE !important
                span
                    color: $main-color !important
        .el-table__column-filter-trigger
            i
                color: #465565
                position: relative
                top: 2px
                left: 2px
                &::before
                    content: '\74' !important
                    font-family: fontastic !important
        .pagination
            top: 50px !important
        .icon-normal
            font-size: 20px
            color: #7E92A2
            position: relative
            top: 5px
            right: 10px
            cursor: pointer

</style>

