<template lang="pug">
     div(v-bind:class=" {'search__transition': openSearch} ")
        div.courses
            .head-box
                h1.title Carreras
                div.action__btns
                    div.search__box
                        i(@click="openSearchModal()").search.icon-ic-search-normal
                    div.options__btn
                        i(@click="addCareer()").add.icon-ic-add-normal
                        el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive} ").courses__dropdown 
                            i.icon-ic-options-normal
                            el-dropdown-menu(slot='dropdown').dropdown--options
                                el-dropdown-item 
                                    i.icon-ic-carga-masiva-normal
                                    | Carga Masiva
                                el-dropdown-item(divided)
                                    i.icon-ic-descarga-plantilla-normal
                                    | Descargar plantilla
                    .options__close
                        el-input.search__input-box(ref="searchInput" autofocus placeholder="Escribe el nombre o abreviatura de la universidad"  v-model.trim="search" maxlength="50")
                            i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")


        div( v-bind:class="{ 'disable__table' : removeOverlay }"  v-if="list != 0")
            el-table.general__table.career_table(
                ref="table"
               :data='list'
               style='width: 100%'
               @sort-change="sortChange"
            )
                el-table-column(sortable="custom",prop='name', label='Nombre de carrera')
                el-table-column(prop='cicles', label='Ciclos', width='180', align="center")
                el-table-column(prop='courses', label='Cursos asociados', width='200',  align="center")
                el-table-column(prop='students', label='Alumnos',  width='180', align="center")
                el-table-column(align="center",  width='120')
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail(@click="goToDetailCareer(scope.row.id)" size="mini" round) VER DETALLE

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
import { eventBus } from "~/event-bus";
import { mapState } from "vuex";
import { termStatus, sort } from "~/enums";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "university",
  components: {
    pagination
  },
  head: {
    title: "Carreras"
  },
  async fetch({ store, params, query }) {
    try {
      let term = store.state.career.term.length >= 2 ? 1 : Number(query.page);
      if (params.university) store.commit("career/setPagination", term || 1);
      query.term
        ? store.commit("career/setTerm", query.term)
        : store.commit("career/setTerm", termStatus.NEGATIVE);
      store.commit("career/setSort");
      await store.dispatch("career/getList", params.university);
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      notData: "No hay ninguna carrera ingresada",
      careers: [],
      openSearch: false,
      search: "",
      removeOverlay: false,
      showPagination: false,
      idCollege: "",
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
    addCareer() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${this.idCollege.country}/universities/${
          this.idCollege.university
        }/careers/new`,
        query: {
          page: page
        }
      });
    },
    closeSearch() {
      this.removeOverlay = false;
      this.openSearch = false;
      this.resetList();
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/careers`,
        query: {
          page: Number(this.$route.query.page) || 1
        }
      });
      this.$refs.table.clearSort();
    },
    goToDetailCareer(id) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `careers/detail`,
        query: {
          id: id,
          page: page,
          term: this.$route.query.term
        }
      });
    },
    async pagination(val) {
      this.$store.commit("career/setPagination", val);
      await this.$store.dispatch("career/getList", this.idCollege.university);
      this.$router.push({
        query: { page: val }
      });
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("career/setTerm", termStatus.NEGATIVE);
      this.$store.commit("career/setPagination", page);
      await this.$store.dispatch("career/getList", this.idCollege.university);
    },
    async sortChange(val) {
      let isAscending = val.order == "ascending" ? sort.ASC : sort.DESC;

      if (this.idCollege.university) {
        this.$store.commit("career/setSortName", isAscending);
        await this.$store.dispatch("career/getList", this.idCollege.university);
      }
    },
    changeDropdown(val) {
      this.isActive = val == true ? val : false;
    }
  },
  computed: {
    ...mapState({
      list: state => state.career.career,
      pageSize: state => state.career.limit,
      pageCount: state => state.career.totalPage,
      total: state => state.career.totalCareer,
      currentPage: state => state.career.page
    })
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
        this.$store.commit("career/setTerm", val);
        this.$store.commit("career/setPagination", 1);
        await this.$store.dispatch("career/getList", this.idCollege.university);
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
    pageCount(val) {
      if (val <= 1) {
        this.showPagination = false;
      } else {
        this.showPagination = true;
      }
    },
    list(val) {
      if (val.length == 0) {
        this.notData = "No se encontraron resultados";
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$store.state.career.totalPage <= 1) {
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
    this.$store.commit("career/setTerm", termStatus.NEGATIVE);
  },
  beforeDestroy() {
    document.body.removeEventListener("keyup", e => {
      if (e.keyCode == 27) console.log("beforeDestroy");
      this.$refs.confirmModal.close();
    });
  }
};
</script>