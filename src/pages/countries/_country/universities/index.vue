<template lang="pug">
    div(v-bind:class=" {'search__transition': openSearch} ")
        div.universities
            .head-box.university__head
                h1.title universidades
                div.action__btns
                    div.search__box
                        i(@click="openSearchModal()").search.icon-ic-search-normal
                    .options__btn
                        i.add.icon-ic-add-normal(@click="create") 
                       
                    .options__close
                        el-input.search__input-box(type="text" ref="searchInput" autofocus placeholder="Escribe el nombre o abreviatura de la universidad" v-model="search" maxlength="50")
                            i.search__close-modal(slot="suffix", @click="closeSearch()",class="icon-cross-normal")
            ul.universities__grid.grid__box( v-bind:class="{ 'disable__table' : removeOverlay }", v-if="universities.length")
                li(v-for="(item, i) in universities" :key="i" @click="goUniversity(item, $event)").university__item.grid__item
                    el-card.university__card.grid__card
                        div
                            div.university__status(:class="{ 'active' : item.status == 1 }")
                            h2 {{  item.nickName }}
                            h3 {{ item.name }}
                            p {{ item.domain }}

                        ul.university__data.data__box
                            li #[strong {{ item.countLocation }}] Sedes
                            li #[strong {{ item.countFacultie }}] Facultades
                            li #[strong {{ item.countStundent }}]  Alumnos
                        i.icon-ic-edit-normal.icon-edit(@click.stop="edit(item._id)")
                        i.icon-ic-next-normal.icon-go
            div.message__no-data(v-else)
                h3 {{ notData }}
            pagination(
                v-if="showPagination"
                :currentPage="currentPage"
                :pageSize="pageSize"
                :pageCount="pageCount"
                layout="prev, pager, next, jumper"
                :total="total"
                @currentPage="pagination"
            )

        div.search-result-container
</template>

<script>
import pagination from "~/components/shared/pagination";
import { mapState } from "vuex";
import { searchKeypressValidation } from "~/mixins";

export default {
  mixins: [searchKeypressValidation],
  layout: "country",
  head: {
    title: "Universidades"
  },
  components: {
    pagination
  },
  async fetch({ store, params, redirect, query }) {
    if (store.getters["account/user/isUniversityAdmin"]) {
      let idCountry = store.state.account.user.user.countries[0];
      let idCollege = store.state.account.user.user.colleges[0];
      redirect(`/countries/${idCountry}/universities/${idCollege}`);
    } else {
      let page = query.page ? Number(query.page) : 1;
      if (params.country) {
        try {
          store.commit("university/setPaginationCollege", page);
          await store.dispatch("university/getList", params.country);
        } catch (error) {
          store.dispatch("catchError", error);
        }
      }
    }
  },
  data() {
    return {
      notData: "No tienes ninguna universidad ingresada",
      removeOverlay: false,
      openSearch: false,
      search: "",
      country: "",
      showPagination: false
    };
  },
  methods: {
    openSearchModal() {
      this.openSearch = true;
      this.removeOverlay = true;
      this.search = "";
      this.$nextTick(() => this.$refs.searchInput.$el.children[0].focus());
    },
    async closeSearch() {
      this.removeOverlay = false;
      this.openSearch = false;
      this.resetList();
      this.autofocus = false;
      this.$router.push({
        query: {
          term: ""
        }
      });
    },
    goUniversity(university, event) {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${this.country}/universities/${university._id}`,
        query: {
          page: page,
          term: this.$route.query.term
        }
      });
    },
    edit(event) {
      this.$router.push({
        path: `/countries/${this.country}/universities/editAndNew`,
        query: {
          type: "edit",
          id: event,
          term: this.$route.query.term
        }
      });
    },
    create() {
      let page = this.$route.query.page ? this.$route.query.page : 1;
      this.$router.push({
        path: `/countries/${this.country}/universities/editAndNew`,
        query: {
          type: "new",
          page: page
        }
      });
    },
    async pagination(val) {
      this.$store.commit("university/setPaginationCollege", val);
      await this.$store.dispatch("university/getList", this.country);
      this.$router.push({
        query: { page: val }
      });
    },
    async resetList() {
      let page = this.$route.query.page ? Number(this.$route.query.page) : 1;
      this.$store.commit("university/setTerm", 0);
      this.$store.commit("university/setPaginationCollege", page);
      await this.$store.dispatch("university/getList", this.country);
    }
  },
  computed: {
    ...mapState({
      universities: state => state.university.list,
      pageSize: state => state.university.limit,
      pageCount: state => state.university.totalPage,
      total: state => state.university.totalCollege,
      currentPage: state => state.university.page
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
      const search = texto;

      if (val.length >= 3) {
        this.$store.commit("university/setTerm", val);
        this.$store.commit("university/setPaginationCollege", 1);
        await this.$store.dispatch("university/getList", this.country);
        this.removeOverlay = false;
        this.$router.push({
          query: {
            page: Number(this.$route.query.page) || 1,
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
    universities(val) {
      if (val.length == 0) {
        this.notData = "No se encontraron resultados";
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.country = this.$route.params.country;
      this.showPagination =
        this.$store.state.university.totalPage <= 1 ? false : true;

      document.body.addEventListener("keyup", e => {
        if (e.keyCode == 27) this.closeSearch();
      });

      this.searchKeypressValidation();
      if (this.$route.query.term) {
        this.openSearchModal();
        this.search = this.$route.query.term;
      }
    });
  }
};
</script>

<style lang="sass">
    .search__transition
        .university__head
            .action__btns
                right: 0 !important
                padding-left: 0 !important
                width: calc(100% - 2px)
    .universities
        .head-box
            max-width: 100%
            &.university__head
                    margin-bottom: 30px
                    .action__btns
                        right: 0px
                        padding-left: 42px
                        box-sizing: border-box
    .universities__grid
        max-width: 950px
        &.disable__table:before
            background: rgba(249, 251, 254, 0.8) !important
    .university__card
        width: 280px
        height: 240px
        .el-card__body 
            display: flex
            flex-direction: column
            justify-content: space-between
        h2 
            font-size: 28px
            letter-spacing: 0.56px
            font-weight: bold
            padding-left: 30px
            overflow: hidden
            text-overflow: ellipsis
            margin-right: 15px
        h3 
            font-size: 18px
            letter-spacing: 0.36px
            font-weight: 500
            margin-bottom: 5px
            margin-top: 5px
        p 
            font-size: 14px
            font-family: $default-font
            letter-spacing: 0.28px
            color: $gray
            font-weight: 100
            -webkit-font-smoothing: antialiased
        .icon-go 
            bottom: 25px !important
    .university__data
        
    .university__status
        width: 16px
        height: 16px
        border-radius: 100%
        background-color: $disabled-color-dark
        position: absolute
        top: 30px
        &.active 
            background-color: $active-color
    input::-webkit-contacts-auto-fill-button
        display: none !important

</style>

