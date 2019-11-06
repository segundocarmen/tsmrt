<template lang="pug">
    .detail--questions
        h2.title__state-back.question_title
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            | Detalle de pregunta
            i.icon__edit.icon-ic-edit-normal(@click="edit()")
        .detail__box.pt-32
            el-row
                el-col(:span="12")
                    h6.detail__subtitle.mb-8 Pregunta
                    p {{ detail.question }}
                el-col(:span="6")
                    h6.detail__subtitle.mb-8 Dificultad
                    p {{ detail.difficulty }}
            h3.subtitle__blue-general.pt-60 Opciones
            ul.pl-0.pt-15
                li(v-for="(item, i) in detail.options").mb-30
                    h6.detail__subtitle.mb-8 Respuesta 0{{ item.asnwerNumber }}
                        i.icon-ic-check(v-if="i == 0")
                    p {{ item.asnwerDescription }}
                    


</template>

<script>
import { mapState } from "vuex";
import { internType } from "~/enums";

export default {
  layout: "university",
  head: {
    title: "Detalle de Premio"
  },
  async fetch({ store, params, query }) {
    try {
      await store.dispatch("questions/getDetail", query.id);
    } catch (error) {
      console.log(error);
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      prevPage: ""
    };
  },
  methods: {
    edit() {
      let params = this.$route.params;
      let page = this.$route.query.page ? this.$route.query.page : 1;
      let term = this.$route.query.term ? `${this.$route.query.term}` : "";
      this.$router.push({
        path: `/countries/${params.country}/universities/${
          params.university
        }/questions/edit`,
        query: {
          id: this.$route.query.id,
          page: page,
          type: internType.EDIT,
          term: term
        }
      });
    }
  },
  computed: {
    ...mapState({
      detail: state => state.questions.detail
    })
  },
  created() {
    let country = this.$route.params.country;
    let university = this.$route.params.university;
    let page = this.$route.query.page ? `${this.$route.query.page}` : "";
    let term = this.$route.query.term ? `${this.$route.query.term}` : "";

    this.prevPage = `/countries/${country}/universities/${university}/questions?page=${page}&term=${term}`;
  }
};
</script>

<style lang="sass">
    .detail--questions
        h2.title__state-back.question_title
          text-transform: initial
        .detail__box 
            max-width: 900px
            h3 
                font-size: 20px !important
            p 
                font-family: Lato
                font-size: 14px
                letter-spacing: 0.28px
                color: #415061
                font-weight: 100;
                -webkit-font-smoothing: antialiased
                strong 
                    font-weight: 600
        .detail__subtitle
            color: $main-color
            font-size: 10px
            letter-spacing: 0.45px
            font-family: $default-font
            -webkit-font-smoothing: antialiased
            i 
                color: #1283FF
                font-size: 12.5px
                position: relative
                top: 3px
                left: 5px
</style>
