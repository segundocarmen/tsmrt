<template lang="pug">
    div.awards(v-bind:class="[ {'search__transition': openSearch} , {'search__transition': this.$store.state.awards.searchable}]")
        .head-box
            h2.title Premios
            div.action__btns
                div.search__box
                    i(@click="openSearchModal()").search.icon-ic-search-normal
                div.options__btn
                    i(@click="add()").add.icon-ic-add-normal
                    el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive } ").courses__dropdown 
                        i.icon-ic-options-normal
                        el-dropdown-menu(slot='dropdown' :class="{ 'hidden': !showAbleDisable }").dropdown--options
                            el-dropdown-item(@click.native="openModalStatus(true)")
                                i.icon-ic-activar
                                | ACTIVAR PREMIO
                            el-dropdown-item(divided @click.native="openModalStatus(false)")
                                i.icon-ic-desactivar
                                | DESACTIVAR PREMIO
                .options__close
                    el-input.search__input-box(ref="searchInput" autofocus placeholder="Escribe el nombre del premio" v-model.trim="search")
                        i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")

        div(v-bind:class="[{ 'disable__table' : removeOverlay }/*,{'disable__table' : this.$store.state.awards.searchable}*/]")
            el-table.general__table(
                ref="table"
                :data="list"
                style="100%"
                @sort-change="sortChange"
                @filter-change="filterChange"
                @selection-change="handleSelectionChange"
            )
                el-table-column(type='selection')
                el-table-column( class='table-data', sortable="custom", property='name' label='Nombre del premio')
                    template(slot-scope='scope')
                        div {{ scope.row.name }}
                            span.icon-yellow.ml-6.icon-outstanding(v-if="scope.row.outstanding")
                el-table-column( sortable="custom" property='duration', label='Duración')
                //- el-table-column( align="center", property='periodicity', label='Periodicidad', show-overflow-tooltip='')
                el-table-column( 
                    align="left", 
                    prop='status', 
                    label='Estado', 
                    show-overflow-tooltip='' 
                    :filters="filters"
                    :filter-method="filterStatus"
                    filter-placement="bottom-end"
                    width="100px"
                )
                    template(align="center" slot-scope='scope').text-left
                        div.status-circle.mr-5(:class="getStatusClass(scope.row.status)").d-inline-block
                        | {{ scope.row.status }}
                el-table-column( align="center")
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail(@click="goToDetail(scope.row.id)" size="mini" round) VER DETALLE

            pagination.award__pagination(
                v-if="showPagination"
                :currentPage="Number(currentPage)"
                :pageSize="pageSize"
                :pageCount="pageCount"
                layout="prev, pager, next, jumper"
                :total="total"
                @currentPage="pagination"
            )
        confirmModal(ref="confirmModal" @save="updateStatus")
</template>

<script>
import pagination from "~/components/shared/pagination";
import { mapState } from "vuex";
import { eventBus } from "~/event-bus";
import { status, awardStatus, internType, sort, termStatus } from "~/enums";
import confirmModal from "~/components/modals/general";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "country",
  head: {
    title: "Premios"
  },
  components: {
    pagination,
    confirmModal
  },
  async fetch({ store, params, query }) {
    let page = Number(query.page) || 1;
    try {
      store.commit("awards/setPagination", page);
      query.term
        ? store.commit("awards/setTerm", query.term)
        : store.commit("awards/setTerm", termStatus.NEGATIVE);
      store.commit("awards/setSort", {
        sortName: "sortStatus",
        isAscending: sort.ASC
      });
      await store.dispatch("awards/findAwards", params.country);
    } catch (error) {
      console.log("error Award");
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      notData: "No hay ningún premio registrado",
      multipleSelection: [],
      search: this.$store.state.awards.searchValue, //this.$store.state.awards.searchValue,
      openSearch: false,
      removeOverlay: false,
      isActive: false,
      showPagination: false,
      showAbleDisable: false,
      status: false,
      idCountry: "",
      filters: [
        { text: "Activo", value: "Activo" },
        { text: "Inactivo", value: "Inactivo" },
        { text: "Vencido", value: "Vencido" }
      ]
    };
  },
  methods: {
    onPaste(evt) {
      console.log(evt);
    },
    restrictChars: function($event) {
      var regex = new RegExp("^[a-zA-Z0-9 ]+$");
      var key = String.fromCharCode(
        !$event.charCode ? $event.which : $event.charCode
      );
      if (!regex.test(key)) {
        $event.preventDefault();
        return false;
      }
    },
    openSearchModal() {
      this.openSearch = true;
      this.removeOverlay = true;
      this.search = "";
      this.$nextTick(() => this.$refs.searchInput.$el.children[0].focus());
    },
    openModalStatus(isActive) {
      let modalMessage = "";
      let messageVariable = "";
      this.status = isActive;
      if (this.$refs.table.selection.length > 1)
        messageVariable = `estos ${this.counter} premios?`;
      else messageVariable = `este premio`;

      if (isActive)
        modalMessage = `¿Estás seguro que deseas activar ${messageVariable}`;
      else
        modalMessage = `¿Estás seguro que deseas desactivar ${messageVariable}`;

      this.$refs.confirmModal.open("icon-ic-sponsor", modalMessage);
    },
    closeSearch() {
      this.openSearch = false;
      this.removeOverlay = false;
      this.resetList();
      var obj = { column: null, prop: null, order: null };
      this.sortChange(obj);
      this.$router.push({
        query: {
          page: this.$route.query.page
        }
      });
      this.$refs.table.clearSort();

      this.$store.commit("awards/setSearch", {
        searchable: false,
        searchValue: ""
      });
    },
    async resetList() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$store.commit("awards/setTerm", termStatus.NEGATIVE);
      this.$store.commit("awards/setPagination", page);
      await this.$store.dispatch("awards/findAwards", this.idCountry);
    },
    add() {
      let params = this.$route.params;
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${params.country}/awards/new`,
        query: {
          page: page,
          type: internType.NEW
        },
        meta: { title: "Nuevo premio" }
      });
    },
    changeDropdown() {},
    async updateStatus() {
      try {
        await this.$store.dispatch("awards/updateAwardsStatus", {
          idAwards: this.idsSelected,
          status: this.status ? status.ACTIVE : status.INACTIVE
        });
        await this.$store.dispatch("awards/findAwards", this.idCountry);
      } catch (error) {
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
          : 1;
      let sortName =
        val.prop == "name"
          ? "sortName"
          : val.prop == "duration"
          ? "sortDuration"
          : "sortStatus";

      await this.$store.commit("awards/setSort", { sortName, isAscending });
      await this.$store.dispatch("awards/findAwards", this.idCountry);
    },
    async filterChange(filters) {
      var filtros = filters[Object.keys(filters)];
      var arrFilters = [];
      filtros.map((item, index) => {
        if (item == "Activo") {
          arrFilters.push("1");
        } else if (item == "Inactivo") {
          arrFilters.push("2");
        } else if (item == "Vencido") {
          arrFilters.push("3");
        }
      });
      var selectedFiltes = arrFilters.join();
      if (selectedFiltes == "") {
        selectedFiltes = "1,2,3";
      }
      await this.$store.commit("awards/setStatus", selectedFiltes);
      await this.$store.dispatch("awards/findAwards", this.idCountry);
    },
    handleSelectionChange(val) {
      this.counter = val.length;
      this.multipleSelection = val;
      this.showAbleDisable = Boolean(val.length);
    },
    getStatusClass(val) {
      switch (val) {
        case "Activo":
          return "active";
          break;
        case "Inactivo":
          return "inactive";
          break;
        default:
          return "expired";
      }
    },
    goToDetail(id) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: "awards/detail",
        query: {
          id: id,
          page: page,
          term: this.$route.query.term ? this.$route.query.term : ""
        }
      });
    },
    async pagination(val) {
      this.$store.commit("awards/setPagination", val); //setea la paginación y trae una nueva lista
      await this.$store.dispatch("awards/findAwards", this.idCountry);
      this.$router.push({
        query: { page: val }
      });
    },
    filterStatus(value, row) {
      //send filters data to server
      console.log(value);
      //console.log(this.$route.query.term);
      return row.status === value;
    }
  },
  computed: {
    ...mapState({
      list: state => state.awards.list || [],
      pageSize: state => state.awards.limit,
      pageCount: state => state.awards.totalPage,
      total: state => state.awards.totalAwards,
      currentPage: state => state.awards.page
    }),
    idsSelected() {
      return this.multipleSelection
        ? this.multipleSelection.map(item => item.id)
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
      const search = texto;
      //this.search = texto;
      if (val.length >= 3) {
        this.$store.commit("awards/setSearch", {
          searchable: true,
          searchValue: val
        });
        this.$store.commit("awards/setTerm", val);
        this.$store.commit("awards/setPagination", 1);
        await this.$store.dispatch("awards/findAwards", this.idCountry);
        this.removeOverlay = false;
        this.$router.push({
          query: {
            page: this.$route.query.page,
            term: this.search
          }
        });
      } else if (val == "") {
        console.log("no tiene 3");
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
      if (val < 1) {
        this.showPagination = false;
      } else {
        this.showPagination = true;
      }
    }
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      if (this.$store.state.awards.totalPage <= 1) {
        this.showPagination = false;
      } else {
        this.showPagination = true;
      }
      this.idCountry = this.$route.params.country;
    });
  }
};
</script>


<style lang="sass">
    .icon-outstanding 
        color: #ffce00
        font-size: 14px
        position: relative
        top: 3px
</style>


