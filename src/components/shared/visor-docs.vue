<template lang="pug">
    no-ssr
        sweet-modal.wabu-visor.pt-0(ref="sweetModal" hide-close-button :blocking="true" class="general-dialog wabu-dialog" width="80%")
            div.dialog-footer(:class="{ 'disable' : isDisable }")
                el-button(@click="_close"  :disabled="isDisable" icon="icon-ic-cross-normal" circle)
            el-carousel(v-if="isImage" :interval="4000" arrow="always" height="100%")
                el-carousel-item(v-for="(item, i) in urls" :key="i")
                    //- div.carousel__image(:style="imageStyle(item)")
                    img(:src="item")
                
            iframe(:src="route" width="100%" height="800" style="border: none" v-else)
            
</template>
<script>
import { SweetModal } from "sweet-modal-vue";
import { typeFile } from "~/enums";
export default {
  props: ["url"],
  components: {
    SweetModal
  },
  data() {
    return {
      dialogVisible: false,
      isDisable: false,
      route: "",
      isImage: false,
      urls: [],
      typeFile
    };
  },
  methods: {
    open(val, typeFile) {
      this.findTypeDocument({ url: val, typeFile });
      this.$refs.sweetModal.open();
    },
    _close() {
      this.$refs.sweetModal.close();
      this.route = "";
    },
    findTypeDocument({ url, typeFile }) {
      console.log({ url, typeFile });
      switch (typeFile) {
        case this.typeFile.IMG:
          this.route = url[0].url;
          console.log(this.route);
          break;
        case "pubhtml":
          this.route = url[0].url + "?widget=true&amp;headers=true";
          console.log(this.route);
          break;
        case this.typeFile.PDF:
          this.route =
            "https://docs.google.com/viewer?url=" +
            url[0].url +
            "&embedded=true";
          console.log(this.route);
          break;
        //.ppt' '.pptx' '.doc', '.docx', '.xls', '.xlsx'
        default:
          this.route =
            "https://view.officeapps.live.com/op/embed.aspx?src=" + url[0].url;
          console.log(this.route);
      }
      //   if (typeFile == this.typeFile.IMG) {
      //     this.isImage = true;
      //     this.urls = url;
      //   } else {
      //     this.isImage = false;
      //     switch (typeFile) {
      //       case this.typeFile.IMG:
      //         this.route = url[0];
      //         break;
      //       case "pubhtml":
      //         this.route = url[0] + "?widget=true&amp;headers=true";
      //         break;
      //       case this.typeFile.PDF:
      //         this.route =
      //           "https://docs.google.com/viewer?url=" + url[0] + "&embedded=true";
      //         break;
      //       //.ppt' '.pptx' '.doc', '.docx', '.xls', '.xlsx'
      //       default:
      //         this.route =
      //           "https://view.officeapps.live.com/op/embed.aspx?src=" + url[0];
      //     }
      //   }
    },
    imageStyle(item) {
      return { "background-image": `url(${item})` };
    }
  }
};
</script>


<style lang="sass">
    .wabu-visor
        .sweet-modal
            height: 80%
        .sweet-content,
        .sweet-content-content,
        .el-carousel
            height: 100%
        .sweet-content 
            box-sizing: border-box
        .dialog-footer
            z-index: 111
        .el-carousel
            width: 100%
            padding: 30px
            box-sizing: border-box
            .el-carousel__arrow
                background: transparent
                i 
                    color: $main-color
            .carousel__image
                width: 100%
                height: 100%
                background-size: cover
                background-position: center
            .el-carousel__indicators
                display: none
            .el-carousel__item 
                display: flex
                align-items: center
                justify-content: center
                img 
                    max-width: 100%
                    max-height: 100%
</style>