<template lang="pug">
    .detail.spam-detail.mb-80
        section
            h1.title__state-back 
              nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
              span {{ title }}
        section
          el-upload.upload-demo(drag='', action='https://jsonplaceholder.typicode.com/posts/', :on-preview='handlePreview', :on-remove='handleRemove', :file-list='fileList', multiple='')
            i.el-icon-upload
            .el-upload__text
              | Suelta tu archivo aquí o 
              em haz clic para cargar
            .el-upload__tip(slot='tip') Solo archivos jpg/png con un tamaño menor de 500kb
        footer(:class="{ 'disabled' : btnDisabled}")
            p.footer__error-message(v-html='errorMessage')
            el-button.mr-15(plain round :disabled="btnDisabled" @click="cancel").wabu-btn--edit.wabu-btn--cancel BLOQUEAR COMENTARIO
                i.icon-ic-desactivar.icon__style
            el-button(type="primary" round :disabled="btnDisabled" @click="save").wabu-btn--edit.wabu-btn--save LIMPIAR SPAM
                i.icon-blue.icon__style
        confirmModal(ref="confirmModal" @save="saveData")
</template>

<script>
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
export default {
  layout: "university",
  components: {
    confirmModal
  },
  head: {
    title: "Importar preguntas"
  },
  data() {
    return {
      title: "Cargar preguntas",
      prevPage: "./",
      btnDisabled: false,
      errorMessage: "",
      fileList: []
    };
  },
  computed: {},
  methods: {
    handlePreview() {},
    handleRemove() {},
    cancel() {
      //this.$refs.confirmModal.open("icon-ic-desactivar", ``);
    },
    save() {
      //this.$refs.confirmModal.open("icon-blue", ``);
    },
    sortChange() {},
    sortBy(val) {
      //console.log(val)
    },
    decodeStatus(status) {},
    saveData() {}
  },
  async fetch({ store, params, query, route }) {
    await store.dispatch("spam/getDetail", route.query.id);
  },
  created() {
    /*
    let params = this.$route.params;
    this.prevPage = `/countries/${params.country}/universities/${
      params.university
    }/spam?page=${this.$route.query.page}`;
    */
  }
};
</script>