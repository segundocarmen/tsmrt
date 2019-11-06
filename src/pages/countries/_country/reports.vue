<template lang="pug">
    div(v-bind:class=" {'search__transition': openSearch} ")
        .country-reports
            .head-box
                h2.title Reportes
                div.action__btns
                    div.search__box
                        i(@click="openSearchModal()").search.icon-ic-search-normal
                    .options__close
                        el-input.search__input-box(ref="searchInput" autofocus placeholder="Escribe el nombre de la universidad" v-model.trim="search" maxlength="50")
                            i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")
            div(:class="{ 'disable__table' : removeOverlay }" v-if="list != 0")
                el-table.general__table(
                    ref='multipleTable', 
                    :data="list"
                    style='width: 100%'
                    @sort-change="sortChange"
                )
                    el-table-column( sortable="custom", property='name' label='Nombre de Universidad' label-class-name="labelForDate")
                    el-table-column( align="right")
                        template(slot-scope='scope') 
                            el-button.blue__button.view-detail(@click="dowloadReport(scope.row)" size="mini" round) DESCARGAR REPORTE
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

</template>

<script>
import pagination from "~/components/shared/pagination";
import { mapState } from "vuex";
import { termStatus, sort } from "~/enums";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "country",
  head: {
    title: "Reportes"
  },
  fetch() {},
  components: {
    pagination
  },
  data() {
    return {
      showPagination: true,
      notData: "No tienes solicitudes de universidades",
      openSearch: false,
      search: "",
      removeOverlay: false
    };
  },
  computed: {
    ...mapState({
      list: state => state.reports.list,
      pageSize: state => state.reports.limit,
      pageCount: state => state.reports.totalPage,
      total: state => state.reports.totalReports,
      currentPage: state => state.reports.page
    })
  },
  methods: {
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
        path: `/countries/${this.$route.params.country}/reports`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });
    },
    async pagination(val) {
      this.$store.commit("reports/setPagination", val);
      await this.$store.dispatch("reports/getList", this.$route.params.country);
      this.$router.push({
        query: {
          page: val
        }
      });
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("reports/setTerm", termStatus.NEGATIVE);
      this.$store.commit("reports/setPagination", page);
    },
    async sortChange(val) {},
    async dowloadReport() {}
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
        this.$store.commit("reports/setTerm", val);
        this.$store.commit("reports/setPagination", 1);
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
      if (this.$store.state.reports.totalPage <= 1) {
        this.showPagination = false;
      } else {
        this.showPagination = true;
      }

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
    .country-reports
        .action__btns
            .search__box 
                position: relative
                right: -80px
        
        .el-table__header
            th
                padding-left: 38px
        .el-table__body
            td 
                height: 50px
                padding-left: 38px
                .view-detail
                    width: 138px
                    margin-right: 15px
    .search__transition
        .action__btns
            .search__box 
                right: 0
</style>

