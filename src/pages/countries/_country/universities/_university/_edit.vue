<template lang="pug">
    div.index(v-bind:class="{ 'state__active-university': university.status == 1 }")
        h4.title__state-back
            span.state__university
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            | {{ nameUniversity }}
        el-form.edit__university-detail(@submit.native.prevent)
            locations(
                ref="locations"
                :locations="location"
                @addHeadquarters="addHeadquarters" 
                @deleteHeadquarters="deleteHeadquarters" 
                v-if="showLocations")
            faculties(
                ref="faculties"
                :faculties="faculty" 
                @addFaculties="addFaculties" 
                @deleteFaculty="deleteFaculty" 
                v-if="showFaculties")
                //faculty university.faculties
            footerEdit(
                @cancel="cancel"
                @save="openModal" 
                :disabled="btnDisabled" 
                :errorMessage="''")

        confirmModal(ref="confirmModal" @save="edit")
</template>
<script>
import footerEdit from "~/components/shared/footer-edit";
import locations from "~/components/university/locations";
import faculties from "~/components/university/faculties";
import calendar from "~/components/university/calendar";
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
import { lettersAndNumbersMixin } from "~/mixins";
import { minLength } from "vuelidate/lib/validators";
import { withParams } from "vuelidate/lib/validators/common";
import period from "~/components/courses/period-item";
import { eventBus } from "~/event-bus";
import { crudStatus } from "~/enums";

export default {
  layout: "university",
  mixins: [lettersAndNumbersMixin],
  components: {
    footerEdit,
    confirmModal,
    period,
    locations,
    faculties,
    calendar
  },
  head: {
    title: "Editar universidad"
  },
  async fetch({ store, query, params, redirect }) {
    try {
      if (query.of == "faculties") {
        await store.dispatch(
          "college/faculty/findFacultiesForCollege",
          params.university
        );
      } else if (query.of == "locations") {
        await store.dispatch(
          "college/location/findLocationsForCollege",
          params.university
        );
      }
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    let params = this.$route.params;
    let route;
    let university = JSON.parse(
      JSON.stringify(this.$store.state.university.detail)
    );
    let universityName = university
      ? university.name
      : "Nombre de la universidad";
    let faculty = JSON.parse(
      JSON.stringify(this.$store.state.college.faculty.faculties)
    );
    let location = JSON.parse(
      JSON.stringify(this.$store.state.college.location.locations)
    );
    if (this.$route.query.page) {
      let page = `?page=${this.$route.query.page}` || `?page=1`;
      route = `/countries/${params.country}/universities${page}`;
    } else {
      route = `/countries/${params.country}/universities/${params.university}`;
    }
    return {
      university,
      nameUniversity: universityName,
      num1: 1,
      period1: "",
      options4: [],
      options5: [],
      headquarterInput: "",
      facultyInput: "",
      headquarters: [],
      faculties: [],
      loading: false,
      headquarterExist: false,
      facultyExist: false,
      startCicle: 0,
      endCicle: 0,
      name: "",
      prevPage: route,
      periodsCounter: null,
      idCollege: params.university,
      addLocations: [],
      showLocations: false,
      showFaculties: false,
      faculty,
      location,
      isDeleteHeadquarter: true,
      isDeleteFaculty: true,
      typeEdit: null
    };
  },
  validations: {
    headquarterInput: {
      minLength: minLength(3),
      lettersAndNumbers: withParams(
        { type: "lettersAndNumbers" },
        value => !/[^a-zA-Z_0-9ÑñáéíóúÁÉÍÓÚ\s]+$/.test(value)
      )
    },
    facultyInput: {
      minLength: minLength(3),
      letters: withParams(
        { type: "letters" },
        value => !/[^a-zA-ZÑñáéíóúÁÉÍÓÚ\s]/.test(value)
      )
    },
    periodName: {
      minLength: minLength(5)
    }
  },
  computed: {
    ...mapState({
      periodNameList: state => state.college.calendar.periodNameList,
      calendariesStore: state => state.college.calendar.detail
    }),
    headquarterInputErrorMessages() {
      return [
        !this.$v.headquarterInput.$dirty ||
          this.$v.headquarterInput.minLength ||
          "*Debes de ingresar mínimo 3 caracteres",
        !this.$v.headquarterInput.$dirty ||
          this.$v.headquarterInput.lettersAndNumbers ||
          "*Debes ingresar sólo letras y números",
        !this.$v.headquarterInput.$dirty ||
          !this.headquarterExist ||
          "*La sede ya existe"
      ].filter(val => typeof val == "string");
    },
    facultyInputErrorMessages() {
      return [
        !this.$v.facultyInput.$dirty ||
          this.$v.facultyInput.minLength ||
          "*Debes de ingresar mínimo 3 caracteres",
        !this.$v.facultyInput.$dirty ||
          !this.facultyExist ||
          "*La facultad ya existe",
        !this.$v.facultyInput.$dirty ||
          this.$v.facultyInput.letters ||
          "*Debes ingresar sólo letras"
      ].filter(val => typeof val == "string");
    },
    btnDisabled() {
      switch (this.$route.query.of) {
        case "locations":
          let location = this.location;
          let locationStore = this.$store.state.college.location.locations;
          if (location) {
            if (location.length == 0) {
              return true;
            } else {
              let storeLocation = locationStore.map(item => item.name);
              let conditional =
                this.isDeleteHeadquarter &&
                location.length == locationStore.length &&
                !Boolean(
                  location.filter(
                    item => storeLocation.indexOf(item.name) == -1
                  ).length
                )
                  ? false
                  : true;
              return !conditional;
            }
          } else {
            return true;
          }
          break;
        case "faculties":
          let faculty = this.faculty;
          let facultyStore = this.$store.state.college.faculty.faculties;
          if (faculty) {
            if (faculty.length == 0) {
              return true;
            } else {
              let storeFaculties = facultyStore.map(item => item.name);
              let conditional =
                this.isDeleteFaculty &&
                faculty.length == facultyStore.length &&
                !Boolean(
                  faculty.filter(
                    item => storeFaculties.indexOf(item.name) == -1
                  ).length
                )
                  ? false
                  : true;
              return !conditional;
            }
          } else {
            return true;
          }
          break;
      }
    }
  },
  methods: {
    addHeadquarters(val) {
      this.location.push({
        name: val,
        idLocation: this.location.length,
        typeOperation: crudStatus.CREATED
      });
    },
    addFaculties(val) {
      this.faculty.push({
        name: val,
        idFaculty: this.faculty.length,
        typeOperation: crudStatus.CREATED
      });
    },
    deleteHeadquarters(val) {
      if (this.location[val].typeOperation == crudStatus.CREATED) {
        this.location.splice(val, 1);
      } else {
        this.location[val].typeOperation = crudStatus.DELETED;
        this.isDeleteHeadquarter = !Boolean(
          this.location.filter(item => item.typeOperation == crudStatus.DELETED)
            .length
        );
      }
      this.$refs.locations.$forceUpdate();
    },
    deleteFaculty(val) {
      if (this.faculty[val].typeOperation == crudStatus.CREATED) {
        this.faculty.splice(val, 1);
      } else {
        this.faculty[val].typeOperation = crudStatus.DELETED;
        this.isDeleteFaculty = !Boolean(
          this.faculty.filter(item => item.typeOperation == crudStatus.DELETED)
            .length
        );
      }
      this.$refs.faculties.$forceUpdate();
    },
    openModal() {
      if (this.typeEdit == 1)
        this.$refs.confirmModal.open(
          "icon-ic-libro",
          "¿Estás seguro que deseas editar las facultades?"
        );
      else if (this.typeEdit == 2)
        this.$refs.confirmModal.open(
          "icon-ic-casa",
          "¿Estás seguro que deseas editar las sedes?"
        );
    },
    async edit() {
      try {
        switch (this.$route.query.of) {
          case "faculties":
            await this.$store.dispatch("college/faculty/updateFaculties", {
              idCollege: this.$route.params.university,
              faculties: this.faculty
            });
            break;
          case "locations":
            await this.$store.dispatch("college/location/updateLocations", {
              idCollege: this.$route.params.university,
              locations: this.location
            });
            break;
        }
        this.$router.push(this.prevPage);
      } catch (error) {
        this.$catchError(error);
      }
    },
    cancel() {
      if (this.typeEdit == 1)
        this.$refs.confirmModal.open(
          "icon-ic-libro",
          "¿Estás seguro que deseas cancelar la edición de las facultades?",
          this.prevPage
        );
      else if (this.typeEdit == 2)
        this.$refs.confirmModal.open(
          "icon-ic-casa",
          "¿Estás seguro que deseas cancelar la edición de las sedes?",
          this.prevPage
        );
    },
    error(val) {
      this.namePeriodIsRequired = val.length == 0 ? false : true;
    }
  },
  watch: {
    headquarterInput(val) {
      for (let i = 0; i < this.university.locations.length; i++) {
        if (this.university.locations[i].name == val) {
          this.headquarterExist = true;
          break;
        } else {
          this.headquarterExist = false;
        }
      }
    },
    facultyInput(val) {
      for (let i = 0; i < this.university.faculties.length; i++) {
        if (this.university.faculties[i].name == val) {
          this.facultyExist = true;
          break;
        } else {
          this.facultyExist = false;
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      switch (this.$route.query.of) {
        case "locations":
          this.showLocations = true;
          break;
        case "faculties":
          this.showFaculties = true;
          break;
      }
    });
  },
  created() {
    switch (this.$route.query.of) {
      case "faculties":
        this.typeEdit = 1;
        break;
      case "locations":
        this.typeEdit = 2;
        break;
    }
  }
};
</script>
<style lang="sass">
    .edit__university-detail
        margin-top: 80px
        margin-bottom: 40px
        footer
            background: #F9FBFE
            button
                &:last-child
                        background: linear-gradient(90deg, #1580F2 0%, #9752FF 100%) !important
    .days__on-cicle
        width: 100%
        margin-bottom: 35px
        h3
            color: #2C363F
            font-size: 14px
            letter-spacing: 0.53px
            line-height: 14px
            font-weight: normal
            margin-bottom: 18px
        em
            font-style: inherit
            line-height: 18px
            display: inline-block
            color: #909399
            margin-right: 15px
            font-family: $default-font
            font-size: 14px
    .year__container
        display: flex
        padding: 30px 35px 30px 0
        box-sizing: border-box
        border-radius: 8px
        flex-wrap: wrap
        max-width: 925px
    .year__info-content
        // margin-bottom: 45px
        min-width: 380px
        &:first-child
                margin-right: 50px
    .el-date-editor--daterange.el-input, .el-date-editor--daterange.el-input__inner, .el-date-editor--timerange.el-input, .el-date-editor--timerange.el-input__inner
            width: 100%
    .year__list-item
        display: flex
        flex-direction: column
        margin-bottom: 25px
        .el-range-separator
            font-size: 12px
            font-family: $default-font  
            width: 10% !important
            color: #415061 !important
        .label__style 
            margin-bottom: 0
            &.date
                    margin-bottom: 8px
        .el-range__icon
            color: #415061
        ::-webkit-input-placeholder  /* Chrome/Opera/Safari */
            color: #909399
            font-size: 12px
            line-height: 10px
            font-weight: normal
        ::-moz-placeholder  /* Firefox 19+ */
            color: #909399
            font-size: 12px
            line-height: 10px
            font-weight: normal
        :-ms-input-placeholder  /* IE 10+ */
            color: #909399
            font-size: 12px
            line-height: 10px
            font-weight: normal
        :-moz-placeholder /* Firefox 18- */
            color: #909399
            font-size: 12px
            line-height: 10px
            font-weight: normal

    .card__list-container
        display: flex
        margin-bottom: 23px
        ::-webkit-input-placeholder  /* Chrome/Opera/Safari */
            color: #909399
            font-size: 10px
            line-height: 10px
            font-weight: normal
        ::-moz-placeholder  /* Firefox 19+ */
            color: #909399
            font-size: 10px
            line-height: 10px
            font-weight: normal
        :-ms-input-placeholder  /* IE 10+ */
            color: #909399
            font-size: 10px
            line-height: 10px
            font-weight: normal
        :-moz-placeholder /* Firefox 18- */
            color: #909399
            font-size: 10px
            line-height: 10px
            font-weight: normal

    .autocomplete_list
        display: flex
        min-height: 69px
        box-sizing: border-box
        align-items: center
        border: 0.5px solid rgba(212,215,215,0.69)
        padding: 0 20px
        background-color: rgba(255,255,255,0.4)
        border-radius: 8px
        .blue__item-list i
            top: 50%
            transform: translateY(-50%)
        .blue__item-list
            margin-right: 20px
            margin-bottom: 10px
            margin-top: 10px
        .blue__item-lastname
            font-size: 10px
            letter-spacing: 0.2px
            line-height: 20px
        .el-select__tags
            > span
                    opacity: 0
                    visibility: hidden
                    position: absolute
                    pointer-events: none
                    display:    none
        input
            padding-left: 10px
            padding-right: 10px
            padding-bottom: 2px
            margin-left: 0 !important
        .el-input__inner
            height: 24px !important
        .el-form-item__content
            line-height: 30px
    .card__list-style
        display: flex
        flex-direction: column
        width: 900px
        margin-right: 50px
        ul
            //padding-left: 0
    .el-form-item__error
        padding-top: 0
    .state__university
        height: 16px
        width: 16px
        display: flex
        background: #99A4A6
        border-radius: 50%
        margin-right: 10px
    .index
        &.state__active-university
            .state__university
                background: #7ED321
</style>

