import {
  apiFindAwards,
  apiAwardDetail,
  apiAwardCreate,
  apiAwardUpdate,
  apiUpdateImagesUrl,
  apiAwardWinners,
  apiUpdateAwardsStatus
} from "~/api/awards";
import { termStatus, sort } from "~/enums";
import { debug } from "util";
import { apiCollageUniversityforStatus } from "../api/college";
import { apiUpdateCollegesAward } from "../api/awards";

export const state = () => ({
  list: [],
  detail: {},
  term: termStatus.NEGATIVE,
  page: 1, //skip
  limit: 10,
  totalPage: null,
  totalAwards: null,
  sortName: sort.ASC,
  sortDuration: 0,
  sortStatus: sort.ASC,
  addStatus: "1,2,3",
  listWinnersByUniversity: [],
  listActiveUniversity: [],

  searchable: false,
  searchValue: ""
});

export const mutations = {
  setSearch(state, { searchable, searchValue }) {
    state.searchable = searchable;
    state.searchValue = searchValue;
  },

  setTerm(state, data) {
    state.term = data;
  },
  setAwards(state, data) {
    state.totalAwards = data.countRecord;
    state.totalPage = data.countPage;
    const setStatus = status => {
      if (status === 1) return "Activo";
      else if (status === 2) return "Inactivo";
      else return "Vencido";
    };
    state.list = (Array.isArray(data.awards) ? data.awards : []).map(item => ({
      name: item.name,
      duration: item.duration,
      status: setStatus(item.status),
      id: item.idAward
    }));
  },
  setDetail(state, data) {
    state.detail = data;
  },
  setSort(state, { sortName, isAscending }) {
    state.sortName = sortName == "sortName" ? isAscending : 0;
    state.sortDuration = sortName == "sortDuration" ? isAscending : 0;
    state.sortStatus = sortName == "sortStatus" ? isAscending : 0;
  },
  setPagination(state, currentPage) {
    state.page = currentPage;
  },
  setWinners(state, data) {
    state.listWinnersByUniversity = data;
  },
  setListActiveUniversity(state, data) {
    state.listActiveUniversity = data;
  },
  setStatus(state, data) {
    state.addStatus = data;
  }
};

export const actions = {
  async findAwards({ state, commit }, id) {
    try {
      let response = await apiFindAwards(
        this.$axios,
        id,
        state.term,
        state.page,
        state.limit,
        state.sortName,
        state.sortDuration,
        state.sortStatus,
        state.addStatus
      );
      commit("setAwards", response);
    } catch (error) {
      commit("setAwards", []);
    }
  },
  async getDetail({ commit }, id) {
    try {
      let response = await apiAwardDetail(this.$axios, id);
      commit("setDetail", response);
    } catch (error) {
      commit("setDetail", {});
    }
  },
  async create(
    {},
    {
      idCountry,
      name,
      isOutstanding,
      startString,
      endString,
      countWinners,
      shortDescription,
      longDescription,
      shortImg,
      longImg
    }
  ) {
    return await apiAwardCreate(this.$axios, {
      idCountry,
      name,
      isOutstanding,
      startString,
      endString,
      countWinners,
      shortDescription,
      longDescription,
      shortImg,
      longImg
    });
  },
  async update({}, data) {
    await apiAwardUpdate(this.$axios, data);
  },
  async getWinners({ commit }, data) {
    try {
      const response = await apiAwardWinners(this.$axios, data);
      commit("setWinners", response.winners);
    } catch (error) {
      //console.log("catch", error);
      commit("setWinners", []);
    }
  },
  async getListActiveUniversity({ commit }, data) {
    try {
      const response = await apiCollageUniversityforStatus(this.$axios, data);
      commit("setListActiveUniversity", response);
    } catch (error) {
      commit("setListActiveUniversity", []);
    }
  },
  async updateImagesUrl({}, { idAward, shortUrl, longUrl }) {
    await apiUpdateImagesUrl(this.$axios, idAward, shortUrl, longUrl);
  },
  async changeFileDirectory({}, { key, url }) {
    return await this.$axios.post("/api/s3/change-directory", { key, url });
  },
  async updateCollegesAward({}, data) {
    await apiUpdateCollegesAward(this.$axios, data);
  },
  async updateAwardsStatus({}, data) {
    await apiUpdateAwardsStatus(this.$axios, data);
  },
  async getExcelAwardWinners({}, data) {
    return await this.$axios.post("/api/excel", data);
  }
};
