<template lang="pug">
    div.students__style.edit__student
        h4.title__state-back
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            | {{ title }}
        el-form.mt-48.mb-40(ref="form", :model="form")
            div
                h3.subtitle__blue Información Básica
                el-form-item.input__edit(:error="emailPersonalErrorMessages[0]")
                    span.label__style Correo personal
                    el-input(
                        v-model="form.emailPersonal"
                        @input="$v.form.emailPersonal.$touch()")
            div
                h3.subtitle__blue Información Académica
                el-form-item.input__edit(:error="emailCollegeErrorMessages[0]")
                    span.label__style Correo universitario
                    el-input(
                        v-model="form.emailCollege" 
                        @input="$v.form.emailCollege.$touch()")
            h3.subtitle__blue Puntaje
            p.letter__gray Puntaje Actual 
                strong {{ prevPoints }} pt.
            div.box__points
                el-form-item 
                    el-radio-group(v-model="form.radios")
                        el-radio.margin-right(label="Restar")
                        el-radio(label="Sumar")
                el-form-item.input__points(label="Puntos" )
                    el-input(v-model="form.points" type="text" @change="changePoints" ref="pointsInput")
                
        footerEdit(@cancel="cancel" @save="submit()",  :disabled="btnDisabled",  :errorMessage="errorMessage")
        modal(ref="confirmModal" @save="sendData()")
</template>

<script>
import footerEdit from "~/components/shared/footer-edit";
import modal from "~/components/modals/general";
import { required, minLength, email } from "vuelidate/lib/validators";
import { withParams } from "vuelidate/lib/validators/common";
import { mapState } from "vuex";
import { onlyNumbersMixin } from "~/mixins";
import { typeOperationPoints } from "~/enums";

export default {
  layout: "university",
  components: {
    footerEdit,
    modal
  },
  mixins: [onlyNumbersMixin],
  head: {
    title: "Editar estudiante"
  },
  validations: {
    form: {
      emailPersonal: {
        required,
        email,
        letters: withParams(
          { type: "email" },
          value =>
            !/[^0-9-a-z-ÑñáéíóúäëïöüâêîôûàèìòùÀÈÌÒÙÂÊÎÔÛÁÉÍÓÚÄËÏÖÜ@._\s]/.test(
              value
            )
        )
      },
      emailCollege: {
        email,
        letters: withParams(
          { type: "email" },
          value =>
            !/[^0-9-a-z-ÑñáéíóúäëïöüâêîôûàèìòùÀÈÌÒÙÂÊÎÔÛÁÉÍÓÚÄËÏÖÜ@._\s]/.test(
              value
            )
        )
      }
    }
  },
  async fetch({ store, params, query }) {
    try {
      await store.dispatch("students/getDataForEdit", query.id);
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    let params = this.$route.params;
    let query = this.$route.query;
    let data = this.$store.state.students.dataForEdit;
    return {
      title: "Editar Alumno",
      prevPage: `/countries/${params.country}/universities/${
        params.university
      }/students/detail?id=${query.id}&term=${query.term}&page=${query.page}`,
      errorMessage: "",
      form: {
        points: data.points || 0,
        radios: "Restar",
        emailPersonal: data.email || "",
        emailCollege: data.emailCollege || ""
      },
      prevEmail: data.email,
      prevEmailCollege: data.emailCollege,
      prevPoints: data.points,
      statusBtn: true,
      typeOperation: "",
      isRequired: true
    };
  },
  computed: {
    ...mapState({
      data: state => state.students.dataForEdit
    }),
    btnDisabled() {
      let emailCollege = Boolean(this.emailCollegeErrorMessages.length);
      let email = Boolean(this.emailPersonalErrorMessages.length);
      //return !this.$v.form.$dirty || this.$v.form.$error || this.statusBtn
      return this.statusBtn || emailCollege || email;
    },
    emailPersonalErrorMessages() {
      return [
        !this.$v.form.emailPersonal.$dirty ||
          this.$v.form.emailPersonal.required ||
          "*Debes de ingresar un email",
        !this.$v.form.emailPersonal.$dirty ||
          this.$v.form.emailPersonal.email ||
          "*Debes de ingresar un email válido",
        !this.$v.form.emailPersonal.$dirty ||
          this.$v.form.emailPersonal.letters ||
          "*Debes de ingresar un email válido"
      ].filter(val => typeof val == "string");
    },
    emailCollegeErrorMessages() {
      return [
        !this.$v.form.emailCollege.$dirty ||
          this.$v.form.emailCollege.email ||
          "*Debes de ingresar un email válido",
        !this.$v.form.emailCollege.$dirty ||
          this.$v.form.emailCollege.letters ||
          "*Debes de ingresar un email válido"
      ].filter(val => typeof val == "string");
    },
    multipleListener() {
      return [
        this.form.emailPersonal,
        this.form.emailCollege,
        this.form.points,
        this.form.radios
      ].join();
    }
  },
  methods: {
    submit() {
      this.action = "aceptar";
      this.$refs.confirmModal.open(
        "icon-ic-alumno",
        `¿Estás seguro que deseas realizar cambios en el perfil del alumno?`
      );
    },
    cancel() {
      this.action = "cancelar";
      this.$refs.confirmModal.open(
        "icon-ic-alumno",
        `¿Estás seguro que deseas cancelar cambios en el perfil del alumno?`
      );
    },
    async sendData() {
      try {
        switch (this.action) {
          case "aceptar":
            await this.$store.dispatch("students/update", {
              idStudent: this.$route.query.id,
              email: this.form.emailPersonal,
              emailCollege: this.form.emailCollege,
              typeOperation: this.typeOperation,
              point: Number(this.form.points)
            });
            this.$router.push(this.prevPage);
            break;
          default:
            this.$router.push(this.prevPage);
        }
      } catch (error) {
        this.$catchError(error);
      }
      this.$refs.confirmModal.close();
    },
    changePoints(val) {
      this.isRequired = this.form.radios.length == 0 ? true : false;
    }
  },
  watch: {
    multipleListener() {
      if (
        this.form.emailPersonal == this.prevEmail &&
        this.form.emailCollege == this.prevEmailCollege &&
        this.form.points == this.prevPoints
      ) {
        this.statusBtn = true;
      } else {
        this.statusBtn = false;
      }
    },
    "form.radios"(val) {
      this.typeOperation =
        val == "Restar"
          ? typeOperationPoints.SUBTRACT
          : typeOperationPoints.ADD;
    }
  },
  async mounted() {
    this.$nextTick(() => {
      this.$refs.pointsInput.$el
        .querySelector("input")
        .addEventListener("keypress", this.onlyNumbers);
    });

    document.body.addEventListener("keyup", e => {
      if (e.keyCode == 27) {
        this.$refs.confirmModal ? this.$refs.confirmModal.close() : "";
      }
    });
  },
  created() {
    this.typeOperation =
      this.form.radios == "Restar"
        ? typeOperationPoints.SUBTRACT
        : typeOperationPoints.ADD;
  },
  beforeDestroy() {
    this.$refs.pointsInput.$el
      .querySelector("input")
      .removeEventListener("keypress", this.onlyNumbers);
    document.body.removeEventListener("keyup", e => {
      if (e.keyCode == 27) this.$refs.confirmModal.close();
    });
  }
};
</script>

<style lang="sass">
    
</style>