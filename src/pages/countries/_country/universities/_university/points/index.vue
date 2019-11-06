<template lang="pug">
    .points
        .head-box
            h2.title Puntos

        div(v-if="list != 0")      
            el-table.general__table(
                ref="table"
                :data="list"
                style="width: 100%"
                @sort-change="sortChange"
            )       
                el-table-column(width="40")  
                el-table-column(sortable="custom" property="name" label="Acciones en la app" min-width="300")
                el-table-column(sortable="custom" property="points" label="Puntaje" align="center")
                el-table-column( align="center")
                    template(slot-scope='scope') 
                        el-button.blue__button.view-detail(@click="openModal(scope.row)" size="mini" round) EDITAR
                
            pagination.course__pagination(
                v-if="showPagination"
                :currentPage="currentPage"
                :pageSize="pageSize"
                :pageCount="pageCount"
                layout="prev, pager, next, jumper"
                :total="total"
                @currentPage="pagination"
            )
        div.message__no-data(v-else)
            h3 {{ notData }}

        editPoints(ref="editPoints" @save="edit")
</template>

<script>
import pagination from "~/components/shared/pagination";
import { mapState } from "vuex";
import editPoints from "~/components/modals/points";
import { spamStatus, termStatus, status, internType, sort } from "~/enums";

export default {
  layout: "university",
  head: {
    title: "Puntos"
  },
  components: {
    editPoints,
    pagination
  },
  data() {
    return {
      notData: "No hay ningún punto ingresado",
      multipleSelection: [],
      isActive: false,
      showDeleteOption: false,
      search: "",
      showPagination: true,
      status: false
    };
  },
  methods: {
    async sortChange(val) {
      console.log(val);
      let isAscending =
        val.order == "ascending"
          ? sort.ASC
          : val.order == "descending"
          ? sort.DESC
          : sort.DESC;

      let sortName;

      switch (val.prop) {
        case "name":
          sortName = "sortName";
          break;
        case "points":
          sortName = "sortPoints";
          break;
        default:
          sortName = "sortPoints";
          break;
          return;
      }
      this.$store.commit("points/setSortList", {
        sortName,
        isAscending
      });
      await this.$store.dispatch(
        "points/getList",
        this.$route.params.university
      );
    },
    openModal(data) {
      this.$refs.editPoints.open(data);
    },
    async edit(data) {
      this.$refs.editPoints.close();
      await this.$store.dispatch("points/updatePoint", {
        data,
        id: this.$route.params.university
      });
    },
    async pagination(val) {
      this.$store.commit("points/setPagination", val);
      await this.$store.dispatch(
        "points/getList",
        this.$route.params.university
      );
      this.$router.push({
        query: { page: val }
      });
    }
  },
  computed: {
    ...mapState({
      list: state => state.points.list || [],
      pageSize: state => state.points.limit,
      pageCount: state => state.points.totalPage,
      total: state => state.points.totalItems,
      currentPage: state => state.points.page
    })
  },
  async fetch({ store, params, query }) {
    await store.dispatch("points/getList", params.university);
  }
};
</script>

<style lang="sass">

</style>
