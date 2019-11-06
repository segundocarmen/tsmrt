<template lang="pug">
    no-ssr
        sweet-modal.pt-0(ref="sweetModal" hide-close-button :blocking="true" class="general-dialog wabu-dialog" width="390")
            i(:class="icon")
            img.img__style(v-if="isImage" :src="icon")
            p(v-html="message")
            div.dialog-footer(:class="{ 'disable' : isDisable }")
                el-button(@click="_close"  :disabled="isDisable").wabu-btn.wabu-btn--transparent CANCELAR
                el-button(@click="save"  :disabled="isDisable").dialog-save.wabu-btn.wabu-btn--white  ACEPTAR
</template>

<script>
import { SweetModal } from "sweet-modal-vue";
import { mapState, mapMutations } from "vuex";
import { eventBus } from "~/event-bus";

export default {
  data() {
    return {
      dialogVisible: false,
      isDisable: false,
      isImage: "",
      message: "",
      icon: "",
      redirect: ""
    };
  },
  components: {
    SweetModal
  },
  methods: {
    open(icon, message, redirect) {
      this.$refs.sweetModal.open();
      this.icon = icon;
      this.message = message;
      this.redirect = redirect;
    },
    close() {
      this.isDisable = false;
      if (this.redirect) this.$router.push(this.redirect);
      this._close();
      setTimeout(() => {
        this.cleanData();
      }, 300);
    },
    _close() {
      this.$refs.sweetModal.close();
    },
    save() {
      this.isDisable = true;
      if (this.redirect) {
        this.$router.push(this.redirect);
        return;
      }
      this.$emit("save");
      this._close();
    },
    cleanData(state) {
      this.icon = "";
      this.message = "";
      this.redirect = "";
    }
  },
  watch: {
    icon(val) {
      let conditional = val ? val.length : "";
      this.isImage = conditional > 50 ? true : false;
    }
  }
};
</script>

<style lang="sass" scoped>
    .img__style
        width: 70px
    .wabu-dialog
        .sweet-modal
            .sweet-content
                padding: 35px 35px 25px !important
</style>


