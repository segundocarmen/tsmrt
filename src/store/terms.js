import { apiCountryTerms, apiCountryTermsUpdate } from "../api/country";

export const state = () => ({
  termsConditions: "",
  idCountry: ""
});

export const mutations = {
  setTerm(state, terms) {
    state.termsConditions = terms.termAndCondition;
    state.idCountry = terms._id;
  }
};

export const actions = {
  async getTerm({ state, commit }, id) {
    try {
      commit("setTerm", await apiCountryTerms(this.$axios, id));
    } catch (error) {
      commit("setTerm", {});
    }
  },
  async setTerm({ state, commit }, terms) {
    try {
      commit("setTerm", await apiCountryTermsUpdate(this.$axios, terms));
    } catch (error) {
      commit("setTerm", {});
    }
  }
};
