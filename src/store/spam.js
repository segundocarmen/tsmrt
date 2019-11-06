import {
  apiComentarioSpamList,
  apiComentarioSpamDetail,
  apiBlockComentarioSpam,
  apiCleanComentarioSpam
} from "../api/spam";
import { termStatus, sort, crudStatus } from "~/enums";

export const state = () => ({
  list: [],
  detail: [],
  term: termStatus.NEGATIVE,
  page: 1,
  limit: 10,
  totalPage: null,
  itemsPerPage: 10,
  totalItems: null,
  sortStudent: 0,
  sortTeacher: 0,
  sortReport: 0,
  addStatus: "3,4,5,6"
});

export const mutations = {
  setPagination(state, data) {
    state.page = data;
  },
  setTerm(state, data) {
    state.term = data;
  },
  setSortList(state, { sortName, isAscending }) {
    state.sortStudent = sortName == "sortAuthor" ? isAscending : 0;
    state.sortTeacher = sortName == "sortTitle" ? isAscending : 0;
    state.sortReport = sortName == "sortReports" ? isAscending : 0;
  },
  setList(state, data) {
    //console.log("Bloqueo automatico".replace(/\b\w/g, l => l.toUpperCase()));
    //state.list = Array.isArray(data.comments) ? data.comments : [];
    state.list = (Array.isArray(data.comments) ? data.comments : []).map(
      item => ({
        title: item.teacher,
        autor: item.student,
        reports: item.countReport,
        id: item.idCommentStudent,
        status: item.statusDescription.replace(/\b\w/g, l => l.toUpperCase()),
        statusNumber:
          item.statusDescription == "Bloqueo automatico"
            ? 5
            : item.statusDescription == "Bloqueo manual"
            ? 6
            : item.statusDescription == "Quarentena"
            ? 3
            : 4
      })
    );
    state.totalPage = data.countPage;
    state.totalItems = data.countRecord;
  },
  setStatus(state, data) {
    console.log(data);
    state.addStatus = data;
  },
  setDetail(state, data) {
    state.detail = data;
  }
};

export const actions = {
  async getList({ state, commit }, id) {
    try {
      commit(
        "setList",
        await apiComentarioSpamList(
          this.$axios,
          id,
          state.term,
          state.page,
          state.limit,
          state.sortStudent,
          state.sortTeacher,
          state.sortReport,
          state.addStatus
        )
      );
    } catch (error) {
      commit("setList", []);
    }
  },
  async getDetail({ state, commit }, id) {
    try {
      commit("setDetail", await apiComentarioSpamDetail(this.$axios, id));
    } catch (error) {
      commit("setDetail", []);
    }
  },
  async BloqComment({ commit }, data) {
    let res = await apiBlockComentarioSpam(this.$axios, data);
    console.log(res);
  }
};
