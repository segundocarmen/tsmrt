import {
  apiAuthLogin,
  apiAuthLogOut,
  apiAuthValidateCode,
  apiAuthUpdatePassword
} from "../../api/authentication";

export const state = () => ({
  token: null
});

export const mutations = {
  setToken(state, token) {
    state.token = token;
  }
};

export const actions = {
  async login({ commit, dispatch }, data) {
    const cancellationToken = await dispatch("getCancellationToken", null, {
      root: true
    });
    let response = await apiAuthLogin(
      this.$axios,
      {
        email: data.email,
        password: data.password
      },
      cancellationToken
    );
    commit("setToken", response.token);
    dispatch("account/user/setData", response, { root: true });
    this.$setAuthCookie(response);
  },

  async logout({ commit, dispatch, rootState }) {
    try {
      let response = await apiAuthLogOut(this.$axios, {
        id: rootState.account.user.user.idAdministrator,
        system: rootState.account.user.system
      });
      commit("setToken", null);
      dispatch("account/user/setData", {}, { root: true });
      this.$removeAuthCookie();
    } catch (error) {
      commit("setToken", null);
      dispatch("account/user/setData", {}, { root: true });
      this.$removeAuthCookie();
    }
  }
};
