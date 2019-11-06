<template lang="pug">
    .detail--award
        h2.title__state-back 
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            span.state_circle(:class="getStatusClass(detail.status)")
            | {{ detail.name }}
            i.icon__edit.icon-ic-edit-normal(@click="edit()")
        .detail__box.pt-32
            el-row
                el-col(:span="12")
                    h6.detail__subtitle.mb-8 Duración
                    //- p #[strong {{ detail.duration }}]
                    p Del #[strong {{ detail.startString }}] al #[strong {{ detail.endString}} ]
                el-col(:span="4" :offset="4").pt-20
                    el-checkbox(:value="detail.isOutstanding" ref="checkbox") Destacado
                        i.icon-yellow.ml-5 
            el-row.mt-38
                el-col(:span="12")
                    h6.detail__subtitle.mb-12 Descripción Corta
                    p {{ detail.shortDescription }}
                el-col(:span="4" :offset="4")
                    h6.detail__subtitle Ganadores
                    p {{ detail.countWinners }} 
            el-row.mt-38
                el-col.large-description
                    h6.detail__subtitle.mb-16 Descripción Larga
                    el-input(type="textarea" 
                            :value="detail.longDescription" 
                            :readonly="true" 
                            resize="none"
                            :rows="4"
                    )
            el-row.mt-53
                el-col(:span="12").img-container
                    h6.detail__subtitle.mb-8 Imagen Pequeña
                    img(:src="detail.shortImg").smallImg.mb-40.mt-5
                    h6.detail__subtitle.mb-8 Imagen Grande
                    img(:src="detail.longImg").bigImg.mb-30.mt-5
                el-col(:span="12")
                    el-row
                        el-col(:span="12")
                            h3.subtitle__blue-general Universidades
                        el-col(:span="12").text-right
                            el-dropdown(dropdown trigger="click" @command="handleClick").courses__dropdown 
                                i.icon-ic-options-normal.dropdown__icon
                                el-dropdown-menu(slot='dropdown').dropdown--options
                                    el-dropdown-item(command="1")
                                        i.icon-ic-edit-normal
                                        |  EDITAR UNIVERSIDADES
                                    el-dropdown-item(command="2" divided)
                                        i.icon-ic-descarga-plantilla-normal
                                        | DESCARGAR GANADORES
                    div 
                        el-card(shadow="never").universities-list
                            ul.pl-0(v-if="detail.colleges.length")
                                li(v-for="(item, i) in detail.colleges").flex-layout
                                    span.text
                                        strong {{ item.nickName }} - 
                                        | {{ item.name }}
                                    el-button.blue__button.view-detail(size="mini" round @click="openAwardList(detail.idAward, item.idCollege)") GANADORES
                                        i.icon-ic-crown
                            div(v-else).no-university-list No has registrado ninguna universidad.

        el-dialog(
            title="Ganadores"
            :visible.sync="dialogVisible"
            width="885px"
            :before-close="handleClose"
            class="awards__dialog general-dialog"
            :show-close="false"
        )
            i.dialog---close-icon.icon-ic-cross-normal(@click="dialogVisible = false")
            el-table.general__table(
                ref="table"
                :data="listWinners"
                style="100%"
                :default-sort = "{prop: 'position', order: 'ascending'}"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
            )
                el-table-column(property="position" label="#" align="center" width="50px")
                el-table-column(sortable property="fullName" label="Nombre del Ganador")
                el-table-column(sortable property="career" label="Carrera")
                el-table-column(sortable property="email" label="Correo")
                el-table-column(sortable property="points" label="Puntos")


        
</template>

<script>
import { mapState } from "vuex";
import { awardStatus, sort } from "~/enums";

export default {
  layout: "country",
  head: {
    title: "Detalle de Premio"
  },
  async fetch({ store, params, query }) {
    try {
      await store.dispatch("awards/getDetail", query.id);
    } catch (error) {
      store.dispatch("catchError", error);
    }
  },
  data() {
    return {
      prevPage: "",
      dialogVisible: false,
      awardsList: []
    };
  },
  methods: {
    edit() {
      let term = this.$route.query.term ? `${this.$route.query.term}` : "";
      this.$router.push({
        path: `/countries/${this.$route.params.country}/awards/edit`,
        query: {
          id: this.$route.query.id,
          page: this.$route.query.page,
          type: 2,
          term: term
        }
      });
    },
    async openAwardList(idAward, idCollege) {
      try {
        await this.$store.dispatch("awards/getWinners", {
          idAward: idAward,
          idCollege: idCollege,
          sortFullName: sort.NOT,
          sortCareer: sort.NOT,
          sortEmail: sort.NOT,
          sortPoints: sort.DESC
        });
      } catch (error) {
        this.$store.dispatch("catchError", error);
      }
      this.dialogVisible = true;
    },
    handleClose() {
      console.log("close");
    },
    sortChange() {},
    handleSelectionChange() {},
    async handleClick(type) {
      if (type == 1) {
        this.$router.push(
          `/countries/${
            this.$route.params.country
          }/awards/edit-universities?id=${this.$route.query.id}&page=${
            this.$route.query.page
          }`
        );
      } else {
        const data = {
          hoil: "bebecita"
        };
        try {
          await this.$store.dispatch("awards/getExcelAwardWinners", data);
        } catch (error) {
          this.$store.dispatch("catchError", error);
        }
      }
    },
    getStatusClass(val) {
      switch (val) {
        case awardStatus.ACTIVE:
          return "active";
          break;
        case awardStatus.INACTIVE:
          return "inactive";
          break;
        default:
          return "expired";
      }
    }
  },
  computed: {
    ...mapState({
      detail: state => state.awards.detail,
      listWinners: state => state.awards.listWinnersByUniversity
    })
  },
  mounted() {
    this.$nextTick(() => {
      let params = this.$route.params;
      let term = this.$route.query.term ? `${this.$route.query.term}` : "";

      this.prevPage = `/countries/${params.country}/awards?page=${
        this.$route.query.page
      }&term=${term}`;
    });
  }
};
</script>

<style lang="sass">
    .detail--award
        .title__state-back
            text-transform: initial
        .detail__box
            max-width: 900px
            h3 
                font-size: 20px !important
            p 
                font-family: Lato
                font-size: 14px
                letter-spacing: 0.28px
                color: #415061
                font-weight: 100;
                -webkit-font-smoothing: antialiased
                strong 
                    font-weight: 600
        .img-container
            img
                border-radius: 8px
                overflow: hidden
                object-fit: cover
            .smallImg
                width: 250px
                height: 140px
            .bigImg 
                width: 360px
                height: 360px
        .detail__subtitle
            color: $main-color
            font-size: 10px
            letter-spacing: 0.45px
            font-family: $default-font
            -webkit-font-smoothing: antialiased
        .universities-list 
            border-radius: 8px
            .el-card__body
                padding: 20px 26px
            li 
                justify-content: space-between
                height: 70px
                align-items: center
                border-bottom: 0.5px solid rgba(153,164,166,0.15)
                &:last-child 
                    border-bottom: 0
                .text 
                    font-family: Lato
                    font-size: 14px
                    letter-spacing: 0.28px
                    color: #415061
                    padding-right: 42px
                    strong 
                        font-size: 15px
                .el-button
                    width: 118px
                    flex: none
                    span 
                        position: relative
                        bottom: 5px
                        i 
                            color: $main-color
                            font-size: 13px
                            position: relative
                            top: 3px
                            padding-left: 3px
        .el-checkbox__label
            font-family: $default-font
            font-size: 14px
            -webkit-font-smoothing: antialiased
            color: #415061 !important
            i 
                color: #FFCE00
                position: relative
                top: 2px


        .large-description
            .el-textarea
                border: 1px solid rgba(18, 131, 255, 0.5)
                border-radius: 4px
                padding: 12px 12px
                textarea 
                    border-color: transparent
                    background-color: transparent
                    padding: 0
                    -webkit-font-smoothing: antialiased
                    color: #415061

    .awards__dialog 
        background-color: rgba(249, 251, 254, 0.8)
        .el-dialog
            box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2)
            border-radius: 14px
            border: 1px solid #1283FF
            background: #FCFDFF
            .dialog---close-icon
                color: $main-color
                position: absolute
                z-index: 1
                top: 30px
                right: 30px
                font-size: 15px
                cursor: pointer
            .el-dialog__header
                padding: 35px 31px 0
            .el-dialog__title
                font-size: 20px
                letter-spacing: 0.72px
                font-weight: 600
                font-family: $main-font
                color: #1283FF
                -webkit-font-smoothing: antialiased
            .el-table 
                &:before
                    height: 0 !important
                tr, th
                    background: #FCFDFF !important
                thead
                    tr 
                        th:firs-child 
                            display: none
                        .cell 
                            color: #415061
                .el-table__body
                    tr 
                        &:last-child 
                            td
                                border-bottom: 0
                        td 
                            height: 48px
                        .cell
                            font-weight: 300
                        &:first-child,
                        &:nth-child(2),
                        &:nth-child(3),
                        &:nth-child(4)
                            .cell 
                                font-weight: 600
                                > div 
                                    color: $main-color
            .el-dialog__body 
                padding: 10px 31px 30px

    .no-university-list 
        min-height: 100px
        display: flex
        align-items: center
        opacity: 0.5
        color: #7B8FA0
        font-size: 12px
        letter-spacing: 0.24px
        font-weight: 500
        -webkit-font-smoothing: antialiased
</style>
