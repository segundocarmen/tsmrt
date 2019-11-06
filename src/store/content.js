import img_pdf from "~/assets/images/content/ic_pdf.svg";
import img_xls from "~/assets/images/content/ic_xls.svg";
import img_ppt from "~/assets/images/content/ic_ppt.svg";
import img_doc from "~/assets/images/content/ic_documentos.svg";
import img from "~/assets/images/content/ic_img.svg";
import {
  apiDocumentList,
  apiDocumentDetail,
  apiDocumentListSpam,
  apiBloqDocument
} from "~/api/document";
import { termStatus, sort } from "~/enums";

export const state = () => ({
  activePage: "Contenido",
  list: [],
  listSpam: [],
  limit: 10,
  totalPage: null,
  totalContent: 12,
  page: 1,
  term: termStatus.NEGATIVE,
  sortTitle: sort.ASC,
  sortCourse: 0,
  sortStudent: 0,
  sortStatus: "1,2",
  sortSpamStatus: "3,4,5,6",
  sortLike: 0,
  sortDislike: 0,
  sortAuthor: 0,
  sortCountReport: 0,
  detail: {}
});

export const mutations = {
  setStatus(state, data) {
    state.sortStatus = data;
  },
  setStatusSpam(state, data) {
    state.sortSpamStatus = data;
  },
  setList(state, data) {
    state.totalPage = data.countPage;
    state.totalContent = data.countRecord;
    state.list = data.documents;
  },
  listSpam(state, data) {
    state.totalPage = data.countPage;
    state.totalContent = data.countRecord;
    state.listSpam = data.documents;
  },
  setDetail(state, data) {
    state.detail = data;
  },
  setPagination(state, currentPage) {
    state.page = currentPage;
  },
  setTerm(state, data) {
    state.term = data;
  },
  setSort(state, { sortName, isAscending }) {
    state.sortTitle = sortName == "sortTitle" ? isAscending : 0;
    state.sortCourse = sortName == "sortCourse" ? isAscending : 0;
    state.sortStudent = sortName == "sortStudent" ? isAscending : 0;
    state.sortStatus = sortName == "sortStatus" ? isAscending : 0;
    state.sortLike = sortName == "sortLike" ? isAscending : 0;
    state.sortDislike = sortName == "sortDislike" ? isAscending : 0;

    state.sortAuthor = sortName == "sortAuthor" ? isAscending : 0;
    state.sortCountReport = sortName == "sortCountReport" ? isAscending : 0;
  },
  setActivePage(state, activePage) {
    state.activePage = activePage;
  }
};

export const getters = {
  routeImage(state) {
    switch (state.detail.typeFile) {
      case 1:
        return img_pdf;
      case 2:
        return img_xls;
      case 4:
        return img_ppt;
      case 3:
        return img_doc;
      default:
        return img;
    }
  },
  contentActivePage: state => state.activePage
};

export const actions = {
  async getList({ state, commit }, idCollege) {
    try {
      commit(
        "setList",
        await apiDocumentList(
          this.$axios,
          idCollege,
          state.term,
          state.page,
          state.limit,
          state.sortTitle,
          state.sortCourse,
          state.sortStudent,
          state.sortStatus,
          state.sortLike,
          state.sortDislike
        )
      );
    } catch (error) {
      commit("setList", []);
    }
  },
  async getDetail({ commit }, id) {
    commit("setDetail", await apiDocumentDetail(this.$axios, id));
  },
  async getListSpam({ state, commit }, idCollege) {
    try {
      commit(
        "listSpam",
        await apiDocumentListSpam(
          this.$axios,
          idCollege,
          state.term,
          state.page,
          state.limit,
          state.sortTitle,
          state.sortAuthor,
          state.sortCountReport,
          state.sortSpamStatus
        )
      );
    } catch (error) {
      commit("listSpam", []);
    }
  },
  async BloqContent({ commit }, data) {
    let res = await apiBloqDocument(this.$axios, data);
  }
};
