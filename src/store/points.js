import { sort } from "~/enums";
import { apiPointList, apiPointUpdate } from "../api/points";

export const state = () => ({
  list: [],
  page: 1,
  limit: 10,
  sortDescription: sort.NOT,
  sortPoint: sort.DESC,
  totalPage: null,
  totalItems: null
});

export const mutations = {
  setList(state, data) {
    console.log(data)
    state.list = (Array.isArray(data.points) ? data.points : []).map(item => ({
      id: item._id,
      name: item.description,
      points: item.quantityPoint
    }));
    state.totalPage = data.countPage;
    state.totalItems = data.countRecord;
  },
  setPagination(state, data) {
    state.page = data;
  },
  setSortList(state, { sortName, isAscending }) {
    state.sortDescription = sortName == "sortName" ? isAscending : 0;
    state.sortPoint = sortName == "sortPoints" ? isAscending : 0;
  }
};

export const actions = {
  async getList({ state, commit }, id) {
    try {
      commit(
        "setList",
        await apiPointList(
          this.$axios,
          id,
          state.page,
          state.limit,
          state.sortDescription,
          state.sortPoint
        )
      );
    } catch (error) {
      commit("setList", []);
    }
  },
  async updatePoint({ state, commit, dispatch }, data) {
    let res = await apiPointUpdate(this.$axios, data.data);
    dispatch("getList", data.id);
  }
};
