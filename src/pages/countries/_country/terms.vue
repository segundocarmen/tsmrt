<template lang="pug">
    div.terms
        .head-box
            h2.title Términos y Condiciones
            div.action__btns
                div
                    i(@click="edit()" v-show="readOnly").icon-ic-edit-normal

        .terms-content.mt-50(:class="{ 'edit': !readOnly }")
            el-input(
                type="textarea"
                :autosize="{ minRows: 12, maxRows: 25 }"
                placeholder="Escribe los términos y condiciones"
                v-model="termsContent"
                :readonly="readOnly"
                resize="none"
            )
        footerEdit(v-if="!readOnly" @cancel="cancel" @save="openModal" :disabled="btnDisabled")
        confirmModal(ref="confirmModal" @save="save")
</template>

<script>
import footerEdit from "~/components/shared/footer-edit";
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
export default {
  layout: "country",
  head: {
    title: "Términos y condiciones"
  },
  components: {
    footerEdit,
    confirmModal
  },
  data() {
    return {
      termsContent: this.termsConditions,
      id: this.idCountry,
      readOnly: true,
      btnDisabled: false
    };
  },
  methods: {
    edit() {
      this.readOnly = false;
    },
    openModal() {
      this.$refs.confirmModal.open(
        "icon-ic-legal",
        "¿Estás seguro que deseas realizar cambios a los términos y condiciones?"
      );
    },
    async save() {
      // try {

      // } catch(error) {
      //     console.log(error)
      // }
      await this.$store.dispatch("terms/setTerm", {
        idCountry: this.$route.params.country,
        termAndConditions: this.termsContent
      });
      this.readOnly = true;
      this.$refs.confirmModal.close();
    },
    cancel() {
      this.$refs.confirmModal.open(
        "icon-ic-legal",
        "¿Estás seguro que deseas cancelar la edición de los términos y condiciones?"
      );
    }
  },
  created() {
    this.termsContent = this.termsConditions;
  },
  computed: {
    ...mapState({
      termsConditions: state => state.terms.termsConditions,
      idCountry: state => state.terms.idCountry
    })
  },
  async fetch({ store, params, query }) {
    await store.dispatch("terms/getTerm", params.country);
  }
};
</script>
<style lang="sass">
    .terms 
        .action__btns
            justify-content: flex-end
            right: 0px
        .terms-content
            border-radius: 4px
            padding: 40px 37px 25px
            background-color: rgba(255,255,255,0.6)
            @include transition(.25s)
            &.edit 
                border: 1px solid #9ecaff
                background-color: #ffffff
        textarea 
            border-color: transparent !important
            outline: none
            font-family: $default-font
            font-size: 14px
            background: transparent
        
</style>

