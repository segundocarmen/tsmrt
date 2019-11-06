<template lang="pug">
    .award-university
        h2.title__state-back 
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            | Editar universidades
        
        h3.subtitle__blue-general.mt-50 Universidades Activas
        el-card(shadow="never").mb-80.mt-20
            el-checkbox-group(v-model="checkList")
                el-checkbox(v-for="(item, i) in universities" :key="i" :label="item") #[strong {{ item.nickName }}] - {{ item.name }}

        footerEdit(@cancel="cancel" @save="submit()",  :disabled="false",  errorMessage="")
        confirmModal(ref="confirmModal" @save="saveData")

</template>

<script>
import footerEdit from "~/components/shared/footer-edit";
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
import { status } from "~/enums";

export default {
  layout: "country",
  head: {
    title: "Editar Universides"
  },
  components: {
    footerEdit,
    confirmModal
  },
  async fetch({ store, params, query }) {
    console.log("33editvue", query.id);
    try {
      await store.dispatch("awards/getListActiveUniversity", {
        idCountry: params.country,
        idAward: query.id,
        status: status.ACTIVE
      });
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      prevPage: "",
      // universities: [
      //     { name: 'UP', nickname: 'Universidad del Pacífico', isChecked: true },
      //     { name: 'UL', nickname: 'Universidad de Lima', isChecked: true },
      //     { name: 'UCH', nickname: 'Universidad Cayetano Heredia', isChecked: true },
      //     { name: 'UPC', nickname: 'Universidad Peruana de Ciencias Aplicadas', isChecked: true },
      //     { name: 'UL', nickname: 'Universidad de Lima', isChecked: true },
      //     { name: 'UP', nickname: 'Universidad de Piura', isChecked: false },
      //     { name: 'PUCP', nickname: 'Pontificia Universidad Católica del Perú', isChecked: false },
      // ],
      checkList: [],
      idAward: ""
    };
  },
  methods: {
    submit() {
      this.$refs.confirmModal.open(
        "icon-ic-sponsor",
        "¿Estás seguro que deseas guardar los cambios?"
      );
    },
    cancel() {
      this.$refs.confirmModal.open(
        "icon-ic-sponsor",
        "¿Esta seguro que desea cancelar la edición de universidades?",
        this.prevPage
      );
    },
    async saveData() {
      try {
        const checkList = this.checkList.map(item => item.idCollege);
        await this.$store.dispatch("awards/updateCollegesAward", {
          idAward: this.idAward,
          idColleges: checkList
        });
      } catch (error) {
        console.log(error);
        this.$store.dispatch("catchError", error);
      }

      this.$router.push(this.prevPage);
    }
  },
  computed: {
    ...mapState({
      universities: state => state.awards.listActiveUniversity
    })
  },
  created() {
    this.checkList = this.universities.filter(item => item.isChecked);
    let params = this.$route.params;
    let query = this.$route.query;
    this.idAward = query.id;
    this.prevPage = `/countries/${params.country}/awards/detail?id=${
      query.id
    }&page=${query.page}`;
  }
};
</script>

<style lang="sass">
    .award-university
        h3 
            font-size: 20px !important
        .el-card 
            width: 400px
            border-radius: 8px
            background-color: rgba(255,255,255,0.4) !important
            .el-card__body
                padding: 30px 20px 30px 25px
            .el-checkbox
                display: block
                margin-left: 0 !important
                margin-bottom: 30px
                display: flex
                &:last-child 
                    margin-bottom: 0
                .el-checkbox__input
                    padding-top: 3px
                .el-checkbox__label 
                    letter-spacing: 0.28px
                    font-family: $default-font
                    color: #415061
                    -webkit-font-smoothing: antialiased
                    font-weight: 100
                    padding-left: 17px
                    word-break: break-word
                    white-space: pre-wrap
                    width: 92%
                    strong 
                        -webkit-font-smoothing: auto
</style>

