<template lang="pug">
    no-ssr
        sweet-modal.pt-0(ref="sweetModal" hide-close-button :blocking="true" class="general-dialog wabu-dialog points-dialog" width="390")
            el-form
                h3 Puntaje:
                el-form-item
                    el-input(type="number" v-model="point" :value="point")
                div.dialog-footer(:class="{ 'disable' : isDisable }")
                    el-button(@click="_close"  :disabled="isDisable").wabu-btn.wabu-btn--transparent CANCELAR
                    el-button(@click="save"  :disabled="isDisable").dialog-save.wabu-btn.wabu-btn--white GUARDAR
</template>

<script>
import { SweetModal } from "sweet-modal-vue";
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
      isDisable: false,
      point: "",
      id: ""
    };
  },
  components: {
    SweetModal
  },
  methods: {
    open({ points, id }) {
      this.$refs.sweetModal.open();
      this.point = points;
      this.id = id;
    },
    close() {
      this.isDisable = false;
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
      this.$emit("save", { idPoint: this.id, points: Number(this.point) });
    },
    cleanData(state) {
      this.id = "";
      this.point = "";
    }
  }
};
</script>

<style lang="sass">
    .points-dialog
        h3
            letter-spacing: 0.58px
            font-size: 16px
            color: #FFFFFF
            font-weight: 500
        .el-form-item 
            margin-top: 20px
            margin-left: 20px
            margin-bottom: 10px
</style>