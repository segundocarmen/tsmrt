<template lang="pug">
    div.edit--awards
        h2.title__state-back 
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            span {{ title }}
        el-form.mt-50.pb-80.mb-40
            h3.subtitle__blue-general Información Básica 
            .flex-layout.flex-align-center.pt-5
                el-form-item(label="Nombre del premio" :error="nameErrorMessage[0]").item__name.mr-48
                    el-input(
                        v-model="detail.name"
                        @input="$v.detail.name.$touch()"
                        width="100px"
                        maxLength="100"
                    )
                el-checkbox(v-model="isOutstanding").checkbox-style.mt-10 
                    | Destacado
                    i.icon-yellow.ml-5 
            .flex-layout
                el-form-item(label="Duración" :error="durationErrorMessage[0]").mr-48
                    el-date-picker.item__duration.range-editor--style(
                        v-model="detail.duration"
                        @input="$v.detail.duration.$touch()"
                        type="daterange"
                        ref="periodPicker"
                        align="right"
                        range-separator="Hasta"
                        start-placeholder="Inicio"
                        end-placeholder="Fin"
                        value-format="yyyy-MM-dd"
                        format="dd-MM-yyyy"
                        :default-value="currentDate"
                        :picker-options="pickerOptions"
                    )
                el-form-item(label="Ganadores").form-item--winner
                    el-select(v-model="detail.winners" placeholder="Seleccionar")
                        el-option(v-for="i in 10" :label="i" :value="i" :key="i")

            el-form-item(label="Descripción Corta" :error="descriptionErrorMessage[0]")
                el-input(type="textarea" 
                    v-model="detail.description"
                    @input="$v.detail.description.$touch()" 
                    :autosize="{ minRows: 3 }" 
                    resize="none"
                    :maxLength="shortDescriptionLimit"
                )
                .characters-counter.fz-8 {{ shortDescriptionCounter }}/{{ shortDescriptionLimit }} caracteres

            el-form-item(label="Descripción Larga" :error="largeDescriptionErrorMessage[0]")
                el-input(type="textarea" 
                    v-model="detail.largeDescription" 
                    @input="$v.detail.largeDescription.$touch()"
                    :autosize="{ minRows: 5, maxRows: 7 }" 
                    resize="none"
                    :maxLength="largeDescriptionLimit"
                )
                .characters-counter.fz-8 {{ largeDescriptionCounter }}/{{ largeDescriptionLimit }} caracteres

            h3.subtitle__blue-general.mt-40 Detalle del Premio
            .flex-layout.dropzone-container.pt-10
                div
                    h4.dropzone-subtitle.mb-12 Imagen Pequeña
                    no-ssr
                        dropzone(
                            ref="dropzoneSmall" 
                            id="smallDropzone"
                            :options="dropzoneOptionsSmall" 
                            :destroyDropzone="true"
                            v-on:vdropzone-thumbnail="thumbnail"
                            :include-styling="false"
                            @vdropzone-success="successDropzone"
                            @vdropzone-sending="sendingDropzone"
                            @vdropzone-processing="processingDropzone"
                            @vdropzone-error="errorDropzone"
                            @vdropzone-canceled="canceledDropzone"
                        )
                div
                    h4.dropzone-subtitle.mb-12 Imagen Grande
                    no-ssr
                        dropzone(
                            ref="dropzoneBig" 
                            id="bigDropzone"
                            :options="dropzoneOptionsBig" 
                            :destroyDropzone="true" 
                            v-on:vdropzone-thumbnail="thumbnail"
                            :include-styling="false"
                            @vdropzone-success="successDropzone2"
                            @vdropzone-sending="sendingDropzone2"
                            @vdropzone-processing="processingDropzone2"
                            @vdropzone-error="errorDropzone2"
                            @vdropzone-canceled="canceledDropzone2"
                )
        footerEdit(@cancel="cancel" @save="submit()",  :disabled="btnDisabled",  :errorMessage="errorMessage")
        confirmModal(ref="confirmModal" @save="saveAward")
</template>

<script>
import footerEdit from "~/components/shared/footer-edit";
import confirmModal from "~/components/modals/general";
import { internType } from "~/enums";
import { required } from "vuelidate/lib/validators";
import { lettersAndNumbersMixin } from "~/mixins";

export default {
  mixins: [lettersAndNumbersMixin],
  layout: "country",
  components: {
    footerEdit,
    confirmModal
  },
  head() {
    return {
      title: this.title
    };
  },
  async fetch({ store, params, query }) {
    if (query.id) {
      try {
        await store.dispatch("awards/getDetail", query.id);
      } catch (error) {
        console.log(error);
        store.dispatch("catchError", error);
      }
    }
  },
  data() {
    let data = {};
    if (this.$route.query.id) {
      data = JSON.parse(JSON.stringify(this.$store.state.awards.detail));
    }
    return {
      isNew: false,
      title: "",
      prevPage: "",
      data,
      detail: {
        id: data.idAward,
        name: data.name || "",
        duration: data.duration ? [data.startString, data.endString] : "",
        periodicity: data.periodicity,
        winners: data.countWinners || 1,
        description: data.shortDescription,
        largeDescription: data.longDescription,
        bigImageUrl: data.longImg || "",
        smallImageUrl: data.shortImg || ""
      },
      isOutstanding: data.isOutstanding || false,
      idAward: "",
      dropzoneDefaultMessage: "",
      dropzoneDefaultMessage2: "",
      shortDescriptionLimit: 90,
      largeDescriptionLimit: 1000,
      errorMessage: "",
      s3Key: "",
      s3Key2: "",
      isImageUploading: false,
      isImageUploading2: false,
      prevName: "",
      prevStartString: "",
      prevEndString: "",
      previsOutstanding: "",
      prevCountWinners: "",
      prevShortDescription: "",
      prevLongDescription: "",
      prevShortImg: "",
      prevLongImg: ""
    };
  },
  methods: {
    submit() {
      this.$v.detail.$touch();
      if (this.$v.detail.error) return;
      if (this.isNew) {
        this.$refs.confirmModal.open(
          "icon-ic-sponsor",
          "¿Estás seguro que deseas crear este premio?"
        );
      } else {
        this.$refs.confirmModal.open(
          "icon-ic-sponsor",
          "¿Estás seguro que deseas editar los datos de este premio?"
        );
      }
    },
    async editAward() {
      let awardInformation = {
        idAward: this.detail.id,
        name: this.detail.name,
        isOutstanding: this.isOutstanding,
        startString: this.detail.duration ? this.detail.duration[0] : "",
        endString: this.detail.duration ? this.detail.duration[1] : "",
        countWinners: Number(this.detail.winners),
        shortDescription: this.detail.description,
        longDescription: this.detail.largeDescription
      };

      try {
        await this.$store.dispatch("awards/update", {
          ...awardInformation,
          shortImg: this.detail.smallImageUrl,
          longImg: this.detail.bigImageUrl
        });
        this.idAward = this.detail.id;
        if (this.s3Key !== "" || this.s3Key2 !== "")
          await this.updateImagesUrl();
        //if(this.s3Key2 !== '') await this.updateImagesUrl2()
        this.$router.push(
          `${this.$route.path.replace("/edit", "/detail")}?id=${
            this.$route.query.id
          }&page=${this.$route.query.page}&term=${this.$route.query.term}`
        );
      } catch (error) {
        console.log(error);
      }
      this.$refs.confirmModal.close();
    },
    async createAward() {
      let response;
      try {
        response = await this.$store.dispatch("awards/create", {
          idCountry: this.$route.params.country,
          name: this.detail.name,
          isOutstanding: this.isOutstanding,
          startString: this.detail.duration ? this.detail.duration[0] : "",
          endString: this.detail.duration ? this.detail.duration[1] : "",
          countWinners: this.detail.winners ? Number(this.detail.winners) : 0,
          shortDescription: this.detail.description
            ? this.detail.description
            : "",
          longDescription: this.detail.description
            ? this.detail.largeDescription
            : "",
          shortImg: "this.detail.smallImageUrl",
          longImg: "this.detail.bigImageUrl"
        });
        this.idAward = response._id;
        await this.updateImagesUrl();
        //if(this.s3Key2 !== '') await this.updateImagesUrl2()
        this.$router.push(this.prevPage);
      } catch (error) {
        console.log(error);
        this.$catchError(error);
      }
      this.$refs.confirmModal.close();
    },
    saveAward() {
      switch (this.$route.params.edit) {
        case "new":
          this.createAward();
          break;
        case "edit":
          this.editAward();
          break;
      }
    },
    cancel() {
      if (this.isNew)
        this.$refs.confirmModal.open(
          "icon-ic-sponsor",
          "¿Esta seguro que desea cancelar la creación de este premio?",
          this.prevPage
        );
      else
        this.$refs.confirmModal.open(
          "icon-ic-sponsor",
          "¿Esta seguro que desea cancelar la edición de este premio?",
          this.prevPage
        );
    },
    successDropzone(file, response) {
      this.detail.smallImageUrl = response.Location;
      this.s3Key = response.Key;
      this.isImageUploading = false;
      this.imageError = "";
      if (document.querySelector(".dz-preview-image"))
        document.querySelector(".dz-preview-image").setAttribute("style", "");
    },
    sendingDropzone(file, xhr, formData) {
      formData.append("idCountry", this.idCountry);
    },
    processingDropzone() {
      this.isImageUploading = true;
      let files = this.$refs.dropzoneSmall.dropzone.files;
      //cuando se arrastra al dropzone mas de un archivo
      if (files.length > 1) {
        this.$refs.dropzoneSmall.dropzone.files.pop();
        document.querySelectorAll(".dz-preview")[0].remove();
      }
    },
    errorDropzone() {
      console.log("error", file, message, xhr);
      this.imageError = message;
      if (
        document.querySelector(".dz-preview-image") &&
        document.querySelector(".dz-preview-image").getAttribute("style")
      ) {
        // document.querySelectorAll(".dz-error")[0].remove()
        document.getElementById("smallDropzone").classList.remove("dz-started");
      }
    },
    canceledDropzone() {
      console.log("cancel");
    },
    successDropzone2(file, response) {
      this.detail.bigImageUrl = response.Location;
      this.s3Key2 = response.Key;
      this.isImageUploading2 = false;
      this.imageError = "";
      if (document.querySelector(".dz-preview-image2"))
        document.querySelector(".dz-preview-image2").setAttribute("style", "");
    },
    sendingDropzone2(file, xhr, formData) {
      formData.append("idCountry", this.idCountry);
    },
    processingDropzone2() {
      this.isImageUploading2 = true;
      let files = this.$refs.dropzoneBig.dropzone.files;
      //cuando se arrastra al dropzone mas de un archivo
      if (files.length > 1) {
        this.$refs.dropzoneBig.dropzone.files.pop();
        document
          .getElementById("bigDropzone")
          .getElementsByClassName("dz-preview")[0]
          .remove();
      }
    },
    errorDropzone2() {
      console.log("error", file, message, xhr);
      this.imageError = message;
      if (
        document.querySelector(".dz-preview-image2") &&
        document.querySelector(".dz-preview-image2").getAttribute("style")
      ) {
        // document.querySelectorAll(".dz-error")[0].remove()
        document.getElementById("bigDropzone").classList.remove("dz-started");
      }
    },
    canceledDropzone2() {
      console.log("cancel");
    },
    async updateImagesUrl() {
      let url1, url2;
      let route = `country/${this.idCountry}/awards`;
      if (this.s3Key == "") url1 = this.detail.smallImageUrl;
      else {
        await this.$store.dispatch("awards/changeFileDirectory", {
          key: this.s3Key,
          url: route
        });
        url1 = this.detail.smallImageUrl.replace(
          `temp/country/${this.idCountry}/awards`,
          route
        );
      }

      if (this.s3Key2 == "") url2 = this.detail.bigImageUrl;
      else {
        await this.$store.dispatch("awards/changeFileDirectory", {
          key: this.s3Key2,
          url: route
        });
        url2 = this.detail.bigImageUrl.replace(
          `temp/country/${this.idCountry}/awards`,
          route
        );
      }
      await this.$store.dispatch("awards/updateImagesUrl", {
        idAward: this.idAward,
        shortUrl: url1,
        longUrl: url2
      });
      this.s3Key = "";
      this.s3Key2 = "";
    },
    // async updateImagesUrl() {
    //     let route =  `country/${this.idCountry}/awards`

    //     await this.$store.dispatch('awards/changeFileDirectory', {
    //         key: this.s3Key,
    //         url: route
    //     })

    //     let url = this.detail.smallImageUrl.replace(`temp/country/${this.idCountry}/awards`, route)

    //     await this.$store.dispatch('awards/updateImagesUrl', {
    //         idAward: this.idAward,
    //         shortUrl: url,
    //         longUrl: this.detail.bigImageUrl
    //     })

    // },
    // async updateImagesUrl2() {
    //     let route =  `country/${this.idCountry}/awards`

    //     await this.$store.dispatch('awards/changeFileDirectory', {
    //         key: this.s3Key2,
    //         url: route
    //     })

    //     let url = this.detail.bigImageUrl.replace(`temp/country/${this.idCountry}/awards`, route)

    //     await this.$store.dispatch('awards/updateImagesUrl', {
    //         idAward: this.idAward,
    //         shortUrl: this.detail.smallImageUrl,
    //         longUrl: url
    //     })

    // },
    template() {
      return `<div class="dz-preview dz-file-preview">
                        <div class="dz-image">
                            <div data-dz-thumbnail-bg></div>
                        </div>
                        <div class="dz-details">
                        </div>
                        <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                        <div class="dz-error-message"><span data-dz-errormessage></span></div>
                        <div class="dz-success-mark"><i class="fa fa-check"></i></div>
                        <div class="dz-error-mark"><i class="fa fa-close"></i></div>
                    </div>
            `;
    },
    thumbnail(file, dataUrl) {
      var j, len, ref, thumbnailElement;
      if (file.previewElement) {
        file.previewElement.classList.remove("dz-file-preview");
        ref = file.previewElement.querySelectorAll("[data-dz-thumbnail-bg]");
        for (j = 0, len = ref.length; j < len; j++) {
          thumbnailElement = ref[j];
          thumbnailElement.alt = file.name;
          thumbnailElement.style.backgroundImage = 'url("' + dataUrl + '")';
        }
        return setTimeout(
          (function(_this) {
            return function() {
              return file.previewElement.classList.add("dz-image-preview");
            };
          })(this),
          1
        );
      }
    }
  },
  computed: {
    currentDate() {
      return this.$moment().format("YYYY-MM-DD");
    },
    pickerOptions() {
      let currentDate = this.$moment().toDate();
      return {
        disabledDate(date) {
          if (date.getDate() == currentDate.getDate()) return false;
          return date < currentDate;
        }
      };
    },
    nameErrorMessage() {
      const errors = [];
      if (!this.$v.detail.name.$dirty) return errors;
      !this.$v.detail.name.required && errors.push(`*Debes ingresar un nombre`);
      return errors;
    },
    descriptionErrorMessage() {
      const errors = [];
      if (!this.$v.detail.description.$dirty) return errors;
      !this.$v.detail.description.required &&
        errors.push(`*Debes ingresar una descripción corta`);
      return errors;
    },
    largeDescriptionErrorMessage() {
      const errors = [];
      if (!this.$v.detail.largeDescription.$dirty) return errors;
      !this.$v.detail.largeDescription.required &&
        errors.push(`*Debes ingresar una descripción larga`);
      return errors;
    },
    durationErrorMessage() {
      const errors = [];
      if (!this.$v.detail.duration.$dirty) return errors;
      !this.$v.detail.duration.required &&
        errors.push(`*Debes ingresar las fechas de duración`);
      return errors;
    },
    urlImgBigErrorMessage() {
      const errors = [];
      if (!this.$v.detail.urlImgBig.$dirty) return errors;
      !this.$v.detail.urlImgBig.required &&
        errors.push(`*Debes ingresar una imagen grande`);
      return errors;
    },
    urlImgSmallErrorMessage() {
      const errors = [];
      if (!this.$v.detail.urlImgSmall.$dirty) return errors;
      !this.$v.detail.urlImgSmall.required &&
        errors.push(`*Debes ingresar una imagen pequeña`);
      return errors;
    },
    btnDisabled() {
      if (this.$route.params.edit == "edit") {
        return (
          this.btnEdit ||
          this.$v.detail.$anyError ||
          this.$v.detail.$invalid ||
          this.isImageUploading ||
          this.isImageUploading2
        );
      } else {
        if (
          this.detail.smallImageUrl == "" ||
          this.detail.bigImageUrl == "" ||
          this.isImageUploading ||
          this.isImageUploading2
        )
          return true;
        return this.$v.detail.$invalid;
      }
    },
    btnEdit() {
      return (
        this.prevName == this.detail.name &&
        this.prevStartString == this.detail.duration[0] &&
        this.prevEndString == this.detail.duration[1] &&
        this.previsOutstanding == this.isOutstanding &&
        this.prevCountWinners == this.detail.winners &&
        this.prevShortDescription == this.detail.description &&
        this.prevLongDescription == this.detail.largeDescription &&
        this.prevShortImg == this.detail.smallImageUrl &&
        this.prevLongImg == this.detail.bigImageUrl
      );
    },
    dropzoneOptionsSmall() {
      return {
        url: `${this.$router.options.base}api/s3/awards`,
        thumbnailWidth: 500,
        thumbnailHeight: 560,
        dictDefaultMessage: this.dropzoneDefaultMessage,
        //previewTemplate: this.template(),
        // dictDefaultMessage: '<div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de </br><strong class="bold">600 x 600 px.</strong></p></div>',
        acceptedFiles: ".png, .jpg, .jpeg"
      };
    },
    dropzoneOptionsBig() {
      return {
        url: `${this.$router.options.base}api/s3/awards`,
        thumbnailWidth: 500,
        thumbnailHeight: 500,
        dictDefaultMessage: this.dropzoneDefaultMessage2,
        // dictDefaultMessage: '<div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de </br><strong class="bold">600 x 600 px.</strong></p></div>',

        acceptedFiles: ".png, .jpg, .jpeg"
      };
    },
    shortDescriptionCounter() {
      return this.detail.description ? this.detail.description.length : 0;
    },
    largeDescriptionCounter() {
      return this.detail.largeDescription
        ? this.detail.largeDescription.length
        : 0;
    }
  },
  validations: {
    detail: {
      name: { required },
      duration: { required },
      largeDescription: { required },
      description: { required }
    }
  },
  mounted() {
    this.$nextTick(() => {
      let params = this.$route.params;
      let id = this.$route.query.id;
      let page = this.$route.query.page;
      let term = this.$route.query.term;
      // this.prevPage = this.isNew ? `/countries/${params.country}/awards` : `/countries/${params.country}/awards/detail?id=${query.id}&page=${query.page}`
      this.prevPage = this.isNew
        ? `/countries/${params.country}/awards`
        : `/countries/${
            params.country
          }/awards/detail?id=${id}&page=${page}&term=${term}`;
    });
  },
  created() {
    this.idCountry = this.$route.params.country;
    if (this.$route.query.type == internType.EDIT) {
      this.isNew = false;
      this.title = "Editar Premio";
      this.dropzoneDefaultMessage = `<div class="dz-img-specifications-container"><div class="dz-preview-image" style="background-image: url(${
        this.detail.smallImageUrl
      })"></div><div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de </br><strong class="bold">250 x 140 px.</strong></p></div></div>`;
      this.dropzoneDefaultMessage2 = `<div class="dz-img-specifications-container"><div class="dz-preview-image2" style="background-image: url(${
        this.detail.bigImageUrl
      })"></div><div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de <strong class="bold">360 x 360 px.</strong></p></div></div>`;
      this.prevName = this.data.name;
      this.prevStartString = this.data.startString;
      this.prevEndString = this.data.endString;
      this.previsOutstanding = this.data.isOutstanding;
      this.prevCountWinners = this.data.countWinners;
      this.prevShortDescription = this.data.shortDescription;
      this.prevLongDescription = this.data.longDescription;
      this.prevShortImg = this.data.shortImg;
      this.prevLongImg = this.data.longImg;
    } else {
      this.isNew = true;
      this.title = "Nuevo Premio";
      this.dropzoneDefaultMessage = `<div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de </br><strong class="bold">250 x 140 px.</strong></p></div>`;
      this.dropzoneDefaultMessage2 = `<div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de <strong class="bold">360 x 360 px.</strong></p></div>`;
    }
  }
};
</script>

<style lang="sass">
    .edit--awards 
        h3 
            font-size: 20px !important
        .el-form 
            max-width: 800px
        .item__name,
        .item__duration
            width: 390px
        .el-form-item__label,
        .dropzone-subtitle
            font-size: 12px
            color: #7B8FA0
            font-family: $default-font
            letter-spacing: 0.46px
            font-weight: 600
            -webkit-font-smoothing: antialiased
        .is-checked
            .el-checkbox__inner
                background-color: #415060 !important
                border-color: #415060 !important
        .el-checkbox__label
            color: #909399 !important
            font-family: $default-font
            font-size: 14px
            -webkit-font-smoothing: antialiased
            i 
                color: #FFCE00
                position: relative
                top: 2px
        .form-item--winner
            width: 93px
        .dropzone-container 
            justify-content: space-between
        #smallDropzone
            width: 250px
            height: 140px
            min-height: 140px
            .icon-ic-add-normal
                color: #9da6af
            p 
                font-weight: 100
                line-height: 1.5
                margin-top: 3px
                font-family: $default-font
                strong 
                    color: #909399
            .dz-img-specifications-container
                height: 100%
                .dz-specifications
                    opacity: 0
                &:hover 
                    .dz-specifications
                        opacity: 0.7
            .dz-preview-image
                background-size: cover
                background-position: center
                height: 100%
                position: absolute
                top: 0
                left: 0
                right: 0
            .dz-specifications
                background-color: rgba(249, 251, 254, 1)
                opacity: 0.7
                padding-top: 25px
                margin: 0
                height: 100%
                @include transition(0.25s)
                i, p
                    //color: #9da6af
                    color: #909399
                    // font-weight: 600
                i 
                    font-size: 38px
                    line-height: 1
                p 
                    font-family: $default-font
                    text-align: center
                    padding: 0 5px 5px
                strong
                    color: #909399
                    font-weight: bold
            .dz-default.dz-message
                margin: 0
                display: block
                position: absolute
                z-index: 999
                width: 100%
                height: 100%
                transition: opacity .2s linear
            &.dz-started
                border: 0
                .dz-default.dz-message
                    opacity: 0
                &:hover 
                    .dz-default.dz-message
                        opacity: 1
            .dz-preview 
                .dz-image
                    width: 250px
                    height: 140px
                    margin-bottom: 10px
                    > div
                        width: inherit
                        height: inherit
                        background-size: contain
                    > img 
                        width: 250px
                        height: 140px
                        object-fit: cover
                // .dz-details
                //     color: white
                //     transition: opacity .2s linear
                //     text-align: center
                //     padding: 0
                //     background-color: #ffffff
                // &:hover 
                //     .dz-details
                //         background-color: rgba(249, 251, 254, 1)
                //         opacity: 0.7;
            .dz-success-mark, .dz-error-mark, .dz-remove
                display: none  
            .dz-image-preview
                margin: 0        
        #bigDropzone
            width: 360px
            height: 360px
            .dz-specifications 
                align-items: center
                display: flex
                flex-direction: column
                justify-content: center
                padding-top: 0
            .icon-ic-add-normal
                color: #9da6af
                font-size: 56px
            p 
                font-weight: 100
                line-height: 1.5
                font-family: $default-font
                font-size: 16px
                margin-top: 20px
                strong 
                    color: #909399
                    font-weight: 500
            .dz-img-specifications-container
                height: 100%
                .dz-specifications
                    opacity: 0
                &:hover 
                    .dz-specifications
                        opacity: 0.7
            .dz-preview-image2
                background-size: cover
                background-position: center
                height: 100%
                position: absolute
                top: 0
                left: 0
                right: 0
            .dz-specifications
                background-color: rgba(249, 251, 254, 1)
                opacity: 0.7
                padding-top: 25px
                margin: 0
                height: 100%
                @include transition(0.25s)
                i, p
                    //color: #9da6af
                    color: #909399
                    // font-weight: 600
                i 
                    font-size: 38px
                    line-height: 1
                p 
                    font-family: $default-font
                    text-align: center
                    padding: 0 5px 5px
                strong
                    color: #909399
                    font-weight: bold
            .dz-default.dz-message
                margin: 0
                display: block
                position: absolute
                z-index: 999
                width: 100%
                height: 100%
                transition: opacity .2s linear
            &.dz-started
                border: 0
                .dz-default.dz-message
                    opacity: 0
                &:hover 
                    .dz-default.dz-message
                        opacity: 1
            .dz-preview 
                .dz-image
                    width: 360px
                    height: 360px
                    margin-bottom: 10px
                    > div
                        width: inherit
                        height: inherit
                        background-size: contain
                    > img 
                        width: 360px
                        height: 360px
                        object-fit: cover
                // .dz-details
                //     color: white
                //     transition: opacity .2s linear
                //     text-align: center
                //     padding: 0
                //     background-color: #ffffff
                // &:hover 
                //     .dz-details
                //         background-color: rgba(249, 251, 254, 1)
                //         opacity: 0.7;
            .dz-success-mark, .dz-error-mark, .dz-remove
                display: none  
            .dz-image-preview
                margin: 0
        .el-textarea 
            border: 1px solid #dcdfe6
            border-radius: 4px
            padding: 15px 18px
            background: #ffffff
            box-sizing: border-box
            .el-textarea__inner
                border: none
                padding: 0
                -webkit-font-smoothing: antialiased

        .characters-counter 
            font-family: $default-font
            color: #909399
            letter-spacing: 0.37px
            opacity: 0.8
            position: absolute
            right: 18px
            bottom: -8px
</style>
