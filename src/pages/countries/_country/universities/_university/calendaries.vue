<template lang="pug">
    div.index(v-bind:class="{ 'state__active-university': university.status == 1 }")
        h4.title__state-back
            span.state__university
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            | {{ nameUniversity }}
        el-form.edit__university-detail(@submit.native.prevent)
            .card__calendar
                h3.subtitle__blue-general.smoothing-antialiased Calendario Académico
                h4.subtitle__black__calendarie Agrega los periodos académicos y configura la fecha de inicio y fin de cada uno.
                .year__container.el-form-item
                    .year__info-content
                        period(v-for="(calendar, i) in countPeriods", 
                            ref="period" 
                            :periodPosition="i" 
                            :period="calendar", 
                            :calendarDates.sync="calendarEndDates" 
                            :calendaries="calendaries"
                            :periodNameList="periodNameList"
                            :key="i" 
                            :periodsArray.sync="calendaries"
                            :endDatesList.sync="initEndDates"
                            @changeDataPeriod="changeDataPeriod"
                            @deletePeriod="deletePeriod"
                            @error="error"
                            @changeName="updateNamePeriod"
                            @calendarChange="calendarChange"
                            @changeYear="changeYear"
                        )
                        el-row(type="flex" justify="center")
                        el-button.button__style.add-new(@click="addPeriod") AGREGAR NUEVO
                            i.icon-ic-add-normal

            footerEdit(
                @cancel="cancel"
                @save="openModal" 
                :disabled="btnDisabled" 
                :errorMessage="''")

        confirmModal(ref="confirmModal" @save="edit")
</template>

<script>
import period from "~/components/university/period-item";
import { eventBus } from "~/event-bus";
import { mapState } from "vuex";
import footerEdit from "~/components/shared/footer-edit";
import confirmModal from "~/components/modals/general";
import { crudStatus } from "~/enums";
import { minLength } from "vuelidate/lib/validators";

export default {
  layout: "university",
  components: {
    footerEdit,
    confirmModal,
    period
  },
  head: {
    title: "Editar universidad"
  },
  async fetch({ store, query, params, redirect }) {
    try {
      await store.dispatch(
        "college/calendar/getPeriodNameList",
        params.university
      );
      await store.dispatch("college/calendar/getDetail", params.university);
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    let params = this.$route.params;
    let university = JSON.parse(
      JSON.stringify(this.$store.state.university.detail)
    );
    let universityName = university
      ? university.name
      : "Nombre de la universidad";
    let calendaries = JSON.parse(
      JSON.stringify(this.$store.state.college.calendar.detail)
    );
    let prevCalendaries = JSON.parse(
      JSON.stringify(this.$store.state.college.calendar.detail)
    );
    let route = `/countries/${params.country}/universities/${
      params.university
    }`;

    return {
      university,
      nameUniversity: universityName,
      prevPage: route,
      idCollege: params.university,
      calendaries,
      prevCalendaries,
      calendarDeleted: [],
      inputsIsComplete: false,
      calendarIsDiferent: false,
      calendarEndDates: [],
      initEndDates: []
    };
  },
  validations: {
    periodName: {
      minLength: minLength(5)
    }
  },
  methods: {
    async edit() {
      try {
        await this.$store.dispatch("college/calendar/updateCalendar", {
          idCollege: this.$route.params.university,
          periods: this.calendaries.concat(this.calendarDeleted)
        });
        this.$router.push(this.prevPage);
      } catch (error) {
        this.$catchError(error);
      }
    },
    openModal() {
      this.$refs.confirmModal.open(
        "icon-ic-calendario",
        "¿Estás seguro que deseas editar los periodos?"
      );
    },
    cancel() {
      this.$refs.confirmModal.open(
        "icon-ic-calendario",
        "¿Estás seguro que deseas cancelar la edición los periodos?",
        this.prevPage
      );
    },
    changeDataPeriod({
      periodName,
      periodYear,
      isAssociated,
      startDate,
      endDate,
      periodPosition,
      yearPosition,
      isIrregular
    }) {
      let periods = this.calendaries;
      periods[periodPosition] = {
        idPeriod: 0,
        periodName,
        isAssociated,
        periodYear,
        isIrregular,
        endString: endDate,
        startString: startDate
      };
    },
    periodDate(data) {
      let position = this.years.indexOf(data.year);
      this.years[position].periods[data.index].date = data.period;
    },
    error(val) {
      this.namePeriodIsRequired = val.length == 0 ? false : true;
    },
    setInitDates() {
      this.initEndDates = [];
      this.calendaries.forEach((item, x) => {
        if (item.endString) {
          let date = this.dateTransform(item.endString);
          this.initEndDates.push(date);
        } else {
          this.initEndDates.push(null);
        }
      });
    },
    addPeriod() {
      this.calendaries.push({
        endString: "",
        idPeriod: "",
        periodName: "",
        periodYear: "Año",
        startString: "",
        isIrregular: false,
        required: true,
        typeOperation: crudStatus.CREATED,
        isAssociated: false
      });
      this.setInitDates();
    },
    calendarUpdate(val) {
      //change startString
      if (this.calendariesStore) {
        let dateStartStore = this.calendariesStore.map(e => e.startString);
        let dateEndStore = this.calendariesStore.map(e => e.endString);

        let dateStart = this.calendaries.map(e => e.startString);
        let dateEnd = this.calendaries.map(e => e.endString);
      }
    },
    deletePeriod(val) {
      let itemDeleted = this.calendaries[val];
      let self = this;

      if (itemDeleted.idPeriod !== "") {
        itemDeleted["typeOperation"] = crudStatus.DELETED;
        self.calendarDeleted.push(itemDeleted);
      }
      this.calendaries.splice(val, 1);

      if (!this.countPeriods.length) {
        this.addPeriod();
      }
    },
    changeDataPeriod({
      periodName,
      periodYear,
      isAssociated,
      isIrregular,
      startDate,
      endDate,
      periodPosition,
      yearPosition,
      inputsComplete,
      typeOperation,
      idPeriod
    }) {
      let periods = this.calendaries;
      if (
        periods[periodPosition].endString !== endDate ||
        periods[periodPosition].startString !== startDate
      ) {
        periods[periodPosition] = {
          periodName,
          periodYear,
          isIrregular,
          isAssociated,
          idPeriod: idPeriod,
          endString: endDate,
          startString: startDate,
          typeOperation,
          required: inputsComplete
        };
      }
      this.setInitDates("changeYearSelected");
    },
    updateNamePeriod(val) {
      //Condition is change name
      let periods = this.calendaries;
      periods[val.position] = {
        periodName: val.periodName,
        periodYear: val.periodYear,
        isIrregular: val.isIrregular,
        isAssociated: val.isAssociated,
        idPeriod: val.id,
        required: val.inputsComplete
      };

      let store = this.calendariesStore.map(item => item.periodName);
      let pageCalendarie = this.calendaries.map(item => item.periodName);
      let calendarie = pageCalendarie.filter(item => store.indexOf(item) == -1);
    },
    dateTransform(value) {
      let date = value.split("-");
      return new Date(`${date[1]}-${date[2]}-${date[0]}`);
    },
    calendarChange() {
      this.inputsIsComplete = !Boolean(
        this.calendaries.filter(item => item.required).length
      );
      if (this.calendaries.length !== this.prevCalendaries.length)
        this.calendarIsDiferent = true;
      else {
        this.calendarIsDiferent =
          this.calendaries.filter(
            (item, i) =>
              this.prevCalendaries[i].endString == item.endString &&
              this.prevCalendaries[i].startString == item.startString &&
              this.prevCalendaries[i].periodYear == item.periodYear &&
              this.prevCalendaries[i].periodName == item.periodName
          ).length !== this.calendaries.length;
      }
    },
    changeYear({ index, year }) {
      this.calendaries[index].periodYear = year;
    }
  },
  watch: {
    calendaries: {
      immediate: true,
      deep: true,
      handler() {
        console.log("calendaries change");
      }
    },
    calendariesWatcher() {
      console.log("calendariesWatcher");
    },
    calendarIsDiferent(val) {
      if (!val)
        this.calendaries.forEach(
          item => item.typeOperation == crudStatus.ORIGINAL
        );
    }
  },
  computed: {
    ...mapState({
      periodNameList: state => state.college.calendar.periodNameList,
      calendariesStore: state => state.college.calendar.detail
    }),
    countPeriods() {
      return this.calendaries;
    },
    calendariesWatcher() {
      return JSON.stringify(this.calendaries);
    },
    btnDisabled() {
      return !(this.inputsIsComplete && this.calendarIsDiferent);
    }
  },
  mounted() {
    this.$nextTick(() => {
      eventBus.$on("setEndDates", ({ index, endDate }) => {
        this.calendarEndDates.splice(index, 1, endDate);
      });
      this.setInitDates();

      if (!this.calendaries.length) {
        this.calendaries.push({
          endString: "",
          idPeriod: "",
          periodName: "",
          isIrregular: false,
          isAssociated: false,
          eriodYear: "Año",
          startString: "",
          required: true,
          isAssociated: false
        });
      }
    });
  }
};
</script>


<style lang="sass">
    .edit__university-detail
        margin-top: 60px
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
    .card__calendar
        .subtitle__black__calendarie
            color: #415061
            font-family: "Open Sans"
            font-size: 16px
            font-weight: 700
            letter-spacing: 0.42px
            line-height: 22px
            -webkit-font-smoothing: antialiased
        .subtitle__blue-general
            color: #1283FF
            font-family: Asap
            font-size: 20px
            font-weight: 600
            letter-spacing: 0.4px
            line-height: 23px
            margin-bottom: 45px
        .notifications__box
            width: 100%
            padding: 48px 20px
        .add-new
            width: 208px
            height: 42px
            border: 1px solid #1283FF
            border-radius: 24px
            padding: 0
            margin-left: 118px
            background-color: transparent
            span
                color: #1283FF
                font-size: 12px
                font-weight: bold
                letter-spacing: 1px
                -webkit-font-smoothing: antialiased
                margin-left: -20px
            .icon-ic-add-normal
                color: #1283FF
                font-size: 16px
                margin-left: 7px
                position: absolute
        .el-input-number__increase, .el-input-number__decrease
            background-color: #F8F9FB !important
        .el-select
            input
                line-height: 10px !important
</style>
