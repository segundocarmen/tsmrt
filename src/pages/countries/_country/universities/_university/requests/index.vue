<template lang="pug">
    div.requests__index(v-bind:class=" {'search__transition': openSearch} ")
        .head-box
            h2.title Solicitudes
            div.action__btns
                div.search__box
                    i(@click="openSearchModal()").search.icon-ic-search-normal
                .options__close
                    el-input.search__input-box(ref="searchInput" autofocus placeholder="Escribe el nombre de la solicitud" v-model.trim="search" maxlength="50")
                        i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")
        el-tabs(type="card" @tab-click="handleClick").mt-32.tab__style
            el-tab-pane(label="Carreras")
                div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="listCareers != 0")
                    el-table.general__table(
                        ref="table"
                        :data="listCareers"
                        style="100%"
                        @sort-change="sortChange"
                        @selection-change="handleSelectionChange"
                    )
                        el-table-column( sortable="custom", property='name' label='Nombre de Carrera')
                        el-table-column( sortable="custom" property='votesNumber', label='Número de Votaciones')

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

            el-tab-pane(label="Cursos")
                div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="listCourses != 0")
                    el-table.general__table(
                        ref="table"
                        :data="listCourses"
                        style="100%"
                        :default-sort = "{prop: 'code', order: 'descending'}"
                        @sort-change="sortChange"
                        @selection-change="handleSelectionChange"
                    )
                        el-table-column( sortable="custom", property='code' label='Código del Curso')
                        el-table-column( sortable="custom" property='type', label='Tipo de Solicitud')
                        el-table-column( sortable="custom" align="center" property='votesNumber', label='Número de votaciones')
                        el-table-column( align="center")
                            template(slot-scope='scope') 
                                el-button.blue__button.view-detail(@click="goToDetail(scope.row.id)" size="mini" round) VER SOLICITUD
            
            el-tab-pane(label="Profesores")
                div(v-bind:class="{ 'disable__table' : removeOverlay }"   v-if="listTeachers != 0")
                    el-table.general__table(
                        ref="table"
                        :data="listTeachers"
                        style="100%"
                        :default-sort = "{prop: 'code', order: 'descending'}"
                        @sort-change="sortChange"
                        @selection-change="handleSelectionChange"
                    )
                        el-table-column( sortable="custom", property='email' label='Correo')
                        el-table-column( sortable="custom" property='type', label='Tipo de Solicitud')
                        el-table-column( sortable="custom" align="center" property='votesNumber', label='Número de votaciones')
                        el-table-column( align="center")
                            template(slot-scope='scope') 
                                el-button.blue__button.view-detail(@click="goToDetail(scope.row.id)" size="mini" round) VER SOLICITUD

</template>
<script>
import pagination from "~/components/shared/pagination";
import { searchKeypressValidation } from "~/mixins";
import { mapState } from "vuex";
export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  data() {
    return {
      notData: "No hay ninguna solicitud ingresada",
      search: "",
      openSearch: false,
      removeOverlay: false,
      list: [],
      removeOverlay: false,
      showPagination: "",
      multipleSelection: ""
    };
  },
  computed: {
    ...mapState({
      listCareers: state => state.request.listCareers,
      listCourses: state => state.request.listCourses,
      listTeachers: state => state.request.listTeachers,
      ageSize: state => state.request.limit,
      pageCount: state => state.request.totalPage,
      total: state => state.request.totalCourses,
      currentPage: state => state.request.page
    })
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
        query: { term: "" }
      });
      this.$refs.table.clearSort();
    },
    resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      // this.$store.commit('teacher/setTerm', 0)
      // this.$store.commit('teacher/setPagination', page)
      // await this.$store.dispatch('teacher/findTeachers', this.idCollege.university)
    },
    sortChange() {},
    handleSelectionChange() {},
    goToDetail(val) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `requests/detail`,
        query: {
          id: val,
          page: page,
          term: this.$route.query.term
        }
      });
    },
    handleClick() {}
  },
  watch: {
    async search() {
      if (val.length >= 3) {
        // this.$store.commit('teacher/setTerm', val)
        // this.$store.commit('teacher/setPagination', 1)
        // await this.$store.dispatch('teacher/findTeachers', this.idCollege.university)
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
    listCareers(val) {
      if (val.length == 0) {
        this.notData = "No se encontraron resultados";
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.idCollege = this.$route.params;
      document.body.addEventListener("keyup", e => {
        if (e.keyCode == 27) this.closeSearch();
      });
      this.searchKeypressValidation();
    });
  }
};
</script>
<style lang="sass">
    .requests__index
        &.search__transition
            .action__btns
                width: 100% !important
                right: 0
        .action__btns
            right: -70px
        .general__table
            thead tr th:first-child
                padding-left: 50px
            .el-table__row
                td 
                    height: 51px
                    &:first-child 
                        padding-left: 50px
        .view-detail
            width: 125px       

    // .request__style
    //     .labelForDate
    //         padding-left: 25px !important
    //     .el-table
    //         tbody
    //             td:first-of-type
    //                 padding-left: 40px !important
    //         td
    //             padding: 16px 0
    //     .message__no-data
    //         margin-top: 110px
</style> 

