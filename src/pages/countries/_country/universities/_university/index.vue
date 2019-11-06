<template lang="pug">
    div.edit__university-container
        div.index( v-bind:class="{ 'state__active-university': university.status == 1 }" )
            .head-box
                div.title__state
                    span.state__university
                    h1.title {{ university.name }}
                div.action__btns
                    //i(@click="editUniversity(university.id)").add.icon-ic-edit-normal
                    el-dropdown.courses__dropdown(dropdown v-if="university.status == 1")
                        i.icon-ic-options-normal
                        el-dropdown-menu(slot='dropdown').dropdown--options
                            el-dropdown-item.dropdown__disable-university(@click.native="disableUniversity()")
                                    i.icon-ic-desactivar
                                    | Deshabilitar universidad
            .card__container
                .card__container-left
                    .card__headquarters.card__style
                        div.action__btns__edit
                            i(@click="editLocation").icon-ic-edit-normal
                        .card__title.blue
                            h3 Sedes
                        ul.card__list(v-if="conditionalLocation" )
                            li(v-for="location in university.locations ") {{ location.name }}
                        p.no__data-style(v-else) No has registrado ninguna sede.
                        img( width= 95   height=131 src="~/assets/images/university/ic_sedes_gradient.png" )
                    .card__faculties.card__style
                        div.action__btns__edit
                            i(@click="editFaculties").icon-ic-edit-normal
                        .card__title.green
                            h3 Facultades
                        ul.card__list(v-if="conditionalFaculties")
                            li(v-for="faculty in university.faculties") {{ faculty.name }}
                        p.no__data-style(v-else) No has registrado ninguna facultad.
                        img( width= 110   height=200 src="~/assets/images/university/ic_facultades_gradient.png" )                        
                .card__container-right.card__style
                    div.action__btns__edit
                        i(@click="editCalendaries").icon-ic-edit-normal
                    .card__title.purple
                            h3 Calendario Académico
                    ul.card__calendary-container
                        li(v-for="(item, i) in namePeriods")
                            h4 {{ item.name }}
                            ul.card__list.cicle__list(v-if="periodsCollege[i].length !== 0")
                                li(v-for="period in periodsCollege[i]")
                                    
                                    h5 {{ period.name }}
                                    p 
                                        i.icon-ic-calendario-normal
                                        | {{ period.startString || '10–06-2019' }} a {{ period.endString || '06-08-2019' }}
                            p.no__data-style(v-else) {{ item.notContentMessage }}
                    img( width=180   height=200 src="~/assets/images/university/ic_calendarioacademico_gradient.png" )                        
                    .card__container-bottom(v-if="existPeriods")
                        li
                            i.icon-ic-notification-normal
                            span 
                                //- TODO: Modificar cuando agreguen las variables 
                                | Notificar
                                em {{ university.notificationDay }}
                                | Días antes del incio del ciclo
                        li
                            i.icon-ic-calification-normal             
                            span 
                                //- TODO: Modificar cuando agreguen las variables 
                                | Calificar
                                em {{ university.qualifyDay }}
                                | Días antes del fin del ciclo
                .card__small-container
                    .small__card.card__style
                        h3.title__small {{ university.countStudents }}
                        span.subtitle__small Alumnos
                        i
                    .small__card.card__style
                        h3.title__small {{ university.countDocument }}
                        span.subtitle__small Contenidos
                        i
                    .small__card.card__style
                        h3.title__small {{ university.countRequest }}
                        span.subtitle__small Solicitudes
                        i
                    .small__card.card__style
                        h3.title__small {{ university.countCareer }}
                        span.subtitle__small Carreras
                        i
                    .small__card.card__style
                        h3.title__small {{ university.countCourse }}
                        span.subtitle__small Cursos
                        i
                    .small__card.card__style
                        h3.title__small {{ university.countTeacher }}
                        span.subtitle__small Profesores
                        i
                    .small__card.card__style
                        h3.title__small {{ university.countSpam }}
                        span.subtitle__small No deseados
                        i
            .footer-card
                p Cuando hayas terminado de cargar toda la data de la universidad, procede a habilitarla.
                el-button.button-secondary(type="primary" @click="openModal()" round :disabled="btnDisabled") HABILITAR UNIVERSIDAD
        confirmModal(ref="confirmModal" @save="ableUniversity")
</template>


<script>
import confirmModal from "~/components/modals/general";
import { mapState } from "vuex";
import { eventBus } from "~/event-bus";

export default {
  layout: "university",
  head: {
    title: "Universidad"
  },
  components: {
    confirmModal
  },
  async fetch({ store, params, query }) {
    console.log("getDetail");
    try {
      await store.dispatch("university/getDetail", params.university);
    } catch (error) {
      console.log(error, "fetch Country");
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      activeUniversity: false,
      namePeriods: [
        {
          name: "Periodo Activo",
          notContentMessage: "Configura las fechas del periodo activo."
        },
        {
          name: "Próximos periodos",
          notContentMessage: "Configura las fechas de los próximos periodos."
        }
      ]
    };
  },
  computed: {
    ...mapState({
      university: state => state.university.detail
    }),
    conditionalLocation() {
      if (this.university.locations)
        return this.university.locations.length ? true : false;
      else return false;
    },
    conditionalFaculties() {
      if (this.university.faculties)
        return this.university.faculties.length ? true : false;
      else return false;
    },
    periodsCollege() {
      let newArray = [];
      let calendaries = Array.isArray(this.university.calendaries)
        ? this.university.calendaries
        : [];
      newArray.push(calendaries.filter(item => item.isActive == true));
      newArray.push(calendaries.filter(item => item.isActive == false));
      return newArray;
    },
    btnDisabled() {
      if (!Object.keys(this.university).length) {
        return true;
      } else {
        return !(
          this.university.locations.length > 0 &&
          this.university.faculties.length > 0 &&
          this.university.countCareer > 0 &&
          this.university.countTeacher > 0 &&
          this.university.countCourse > 0
        );
      }
    },
    existPeriods() {
      if (this.university.calendaries) {
        return Boolean(this.university.calendaries.length);
      } else {
        return false;
      }
    }
  },
  methods: {
    editUniversity(id) {
      this.$router.push(
        `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/edit`
      );
    },
    openModal() {
      this.$refs.confirmModal.open(
        "icon-ic-activar",
        `¿Estás seguro que deseas habilitar esta universidad?`
      );
    },
    async ableUniversity() {
      this.activeUniversity = true;
      try {
        await this.$store.dispatch("university/updatedStatus", {
          idCollege: this.$route.params.university,
          status: this.university.status == 1 ? 2 : 1
        });
        await this.$store.dispatch(
          "university/getDetail",
          this.$route.params.university
        );
      } catch (error) {
        this.errorMessage = error.message;
        this.$store.dispatch("catchError", error);
      }
      this.$refs.confirmModal.close();
    },
    disableUniversity() {
      this.activeUniversity = false;
      this.$refs.confirmModal.open(
        "icon-ic-desactivar",
        `¿Estás seguro que deseas deshabilitar esta universidad? Tus usuarios asociados a esta universidad no podrán acceder a la aplicación.`
      );
    },
    editLocation() {
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/edit`,
        query: { of: "locations" }
      });
    },
    editCalendaries() {
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/calendaries`
      });
    },
    editFaculties() {
      this.$router.push({
        path: `/countries/${this.$route.params.country}/universities/${
          this.$route.params.university
        }/edit`,
        query: { of: "faculties" }
      });
    },
    save() {}
  },
  async created() {
    eventBus.$on("save", () => {
      this.ableUniversity();
      setTimeout(() => {
        eventBus.$emit("closeConfirm");
      }, 500);
    });
  }
};
</script>
<style lang="sass">   
    .index
        .head-box
            margin-bottom: 25px
        &.state__active-university
                .state__university
                    background: #7ED321
                .footer-card
                    display: none
        .button-secondary
            width: 240px
    .edit__university-container
        .action__btns
            right: 0
            .el-dropdown
                position: absolute
                right: 0
        .action__btns__edit
            position: absolute
            right: 10px
            top: 15px
            i
                font-size: 15px
                color: #455364
                cursor: pointer
                //position: relative
    .dropdown__disable-university
        display: flex
        align-items: center
        color: #415061
        text-transform: uppercase
        font-size: 10px
        height: 25px
        i
            display: flex
            margin-right: 15px
            font-size: 20px
    .title__state
        display: flex
        align-items: center
        width: 88%
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis
    .card__list.cicle__list
        display: flex
        flex-wrap: wrap
        > li 
            width:  auto
            flex-basis: 40%
    .card__calendary-container
        margin-top: 5px
        > li 
            width:  auto
            flex-basis: 35%
        li
            &:first-child
                margin-bottom: 10px
                h4
                    color: #9752FF

        h4
            font-weight: bold
            font-size: 14px
            letter-spacing: 0.28px
            line-height: 16px
            margin-bottom: 15px
            color: #415061
        h5
            margin-bottom: 5px

        .no__data-style
            width: auto
            margin-left: 20px

    .no__data-style
        color: #7B8FA0
        letter-spacing: 0.24px
        line-height: 16px
        opacity: 0.5
        font-size: 12px
        font-family: $default-font
        width: 120px
    .cicle__list
        padding-left: 15px  !important
        li
            margin-bottom: 18px
        p
            font-size: 12px
            letter-spacing: 0.24px
            line-height: 14px
            color: #415061
        i
            color: #9752FF
            margin-right: 5px
    .small__card
        &.addZero
                h3
                    &:before
                            content: '0'
    .card__style
        box-shadow: 0 5px 8px 0 rgba(123,143,160,0.3)
        border-radius: 8px
        background-color: #F9FBFE
        padding-left: 100px
        padding-right: 10px
        box-sizing: border-box
        display: flex
        flex-direction: column
        justify-content: center
        position: relative
        overflow: hidden
        ul
            padding-left: 0
        img
            display: block
            height: auto
            max-width: 100%
            opacity: 0.2
            position: absolute
    .state__university
        height: 16px
        width: 16px
        display: flex
        background: #99A4A6
        border-radius: 50%
        margin-right: 10px
    .card__headquarters
        width: 280px
        height: 145px
        margin-bottom: 30px
        .card__list
            height: 65px
        img
            left: 0
        
    .card__faculties
        width: 280px
        height: 215px
        img
            left: -15px
            top: 50px
    .card__title
        margin-bottom: 16px
        h3
            font-size: 22px
            font-family: $main-font
            font-weight: 600
            -webkit-font-smoothing: antialiased
        &.blue
                h3
                    color: #1283FF
        &.green
                h3
                    color: #00D0C8
        &.purple
                h3
                    color: #9752FF
    .card__list
        height: auto
        overflow: auto
        max-height: 100px
        li
            font-size: 12px
            margin-bottom: 12px
        h5
            color: #415061
            font-size: 12px
            font-weight: 800
            letter-spacing: 0.46px
            line-height: 14px
    .card__container
        display: flex
        flex-wrap: wrap
    .card__container-bottom
        width: 100%
        display: flex
        flex-direction: column
        flex: 1
        justify-content: flex-end
        span
            font-size: 12px
            margin-bottom: 10px
            &:last-child
                    margin-bottom: 0
        em
            font-weight: bold
            margin: 0px 5px
            font-style: normal
            display: inline-block
        li
            list-style: none
            display: flex
            align-items: center
            margin-bottom: 15px
            &:last-child
                    margin-bottom: 0
        i
            margin-right: 8px
            color: #9752FF
            font-size: 15px
    .card__container-right
        flex: 1
        margin-left: 30px
        box-sizing: border-box
        padding-left: 35px
        padding-top: 35px
        padding-bottom: 25px
        justify-content: flex-start
        img
            right: 0
            bottom: 20px
    .card__small-container
        width: 100%
        display: flex
        justify-content: space-between
        margin-top: 30px
        flex-wrap: wrap
    .small__card
        min-width: 29%
        min-height: 70px
        display: flex
        // align-items: center
        flex-direction: column
        justify-content: center
        padding-left: 30px
        margin-right: 30px
        margin-bottom: 30px
        &:nth-child(3)
            margin-right: 0
        &:before
                content: ''
                height: 70%
                position: absolute
                left: 0
                top: 0
                bottom: 0
                margin: auto
                width: 4px
                border-radius: 2px
                background-color: #7B8FA0
        i
            position: absolute
            right: -8px
            top: 0
            bottom: 0
            &:before
                    font-family: "fontastic" !important
                    font-style: normal !important
                    font-size: 66px
        h3
            font-size: 23px
            letter-spacing: 0.28px
            color: #415061
        span
            font-size: 14px
            letter-spacing: 0.28px
            line-height: 16px
            color: #7B8FA0
            -webkit-font-smoothing: antialiased
        &:nth-child(1)
                &:before
                        background: #1283FF
                i
                    font-size: 71px
                    color: #1283FF
                    &:before
                            content: "d"
                span
                    color: #1283FF
        &:nth-child(2)
                &:before
                        background: #9752FF
                i
                    font-size: 68px
                    color: #9752FF
                    &:before
                            content: "s"
                span
                    color: #9752FF
        &:nth-child(3)
                &:before
                    background: #00D0C8
                i
                    font-size: 80px
                    top: -5px
                    color: #00D0C8
                    &:before
                        content: "M"
                        font-size: 80px
                span
                    color: #00D0C8
        &:nth-child(4)
                i
                    &:before
                        content: "i"
                        font-size: 70px
        &:nth-child(5)
            i
                right: -12px
                top: -5px
                &:before
                    content: "o"
                    font-size: 75px
        &:nth-child(6)
                i
                    &:before
                            content: "P"
        &:nth-child(7)
                i
                    &:before
                            content: "N"
        &:nth-child(4),
        &:nth-child(5),   
        &:nth-child(6),   
        &:nth-child(7)
                min-width: 22% !important
                margin-right: 3%
                i
                    &:before
                        color: #7B8FA0
                        
        &:nth-child(7)
                margin-right: 0
    .footer-card
        margin-top: 70px
        height: 90px
        display: flex
        align-items: center
        justify-content: space-between
        background: #fff
        position: relative
        p
            font-size: 14px
            letter-spaceing: 0.28px
        &:after,
        &:before
                content: ''
                height: 90px
                background: #fff
                display: flex
                width: 130px
                position: absolute
        &:before
                right: 100%
        &:after
                left: 100%
        .is-disabled
            opacity: 0.3
            &:hover
                opacity: 0.3

</style>
