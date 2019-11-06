import {
  apiQuestionsList,
  apiQuestionsDetail,
  apiQuestionsUpdate,
  apiQuestionsDelete,
  apiUploadMasiveQuestion
} from "../api/questions";
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
  sortQuestion: sort.ASC,
  sortLevel: 1,
  sortDate: 0,
  addStatus: "1,2,3,4,5,6,7,8,9,10"
});

export const mutations = {
  setList(state, data) {
    state.list = (Array.isArray(data.questions) ? data.questions : []).map(
      item => ({
        id: item._id,
        name: item.title,
        level: item.level,
        date: item.registerDate
      })
    );
    state.totalPage = data.countPage;
    state.totalItems = data.countRecord;
  },
  setDetail(state, data) {
    state.detail = {
      idQuestion: data.idQuestion,
      question: data.question,
      difficulty: data.difficulty,
      options: (Array.isArray(data.options) ? data.options : []).map(
        (item, i) => ({
          idAnswer: item.idAnswer,
          asnwerNumber: item.asnwerNumber,
          asnwerDescription: item.asnwerDescription,
          asnwerIsCorrect: !i,
          typeOperation: crudStatus.ORIGINAL
        })
      ),
      registerDate: data.registerDate
    };
  },
  setPagination(state, data) {
    state.page = data;
  },
  setTerm(state, data) {
    state.term = data;
  },
  setSortList(state, { sortName, isAscending }) {
    state.sortQuestion = sortName == "sortQuestion" ? isAscending : 0;
    state.sortLevel = sortName == "sortLevel" ? isAscending : 0;
    state.sortDate = sortName == "sortDate" ? isAscending : 0;
  },
  setStatus(state, data) {
    state.addStatus = data;
  }
};

export const actions = {
  async getList({ state, commit }, id) {
    try {
      let questions = await apiQuestionsList(
        this.$axios,
        id,
        state.term,
        state.page,
        state.limit,
        state.sortQuestion,
        state.sortLevel,
        state.sortDate,
        state.addStatus
      );
      commit("setList", questions);
    } catch (error) {
      commit("setList", []);
    }
  },
  async getDetail({ commit }, id) {
    commit("setDetail", await apiQuestionsDetail(this.$axios, id));
  },
  async delete({}, data) {
    await apiQuestionsDelete(this.$axios, { idQuestions: data });
  },
  async update({}, data) {
    await apiQuestionsUpdate(this.$axios, data);
  },
  async saveQuestions({ state, commit }, data) {
    let res = await apiUploadMasiveQuestion(this.$axios, data);
    //await commit("setList", res);
    console.log(res);
  }
};
