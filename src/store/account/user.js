import { roles, system } from "~/enums";

export const state = () => ({
  user: null,
  system: system.WABU_CMS
});

export const getters = {
  isGlobalAdmin: state =>
    state.user ? state.user.rol == roles.ADMIN_GLOBAL : false,
  isCountryAdmin: state =>
    state.user ? state.user.rol == roles.ADMIN_COUNTRY : false,
  isUniversityAdmin: state =>
    state.user ? state.user.rol == roles.ADMIN_COLLEGE : false,
  roleType: getters => {
    if (getters.isGlobalAdmin) return "Administrador Global";
    else if (getters.isCountryAdmin) return "Administrador País";
    else return "Administrador Universidad";
  }
};

export const mutations = {
  setData(state, data) {
    state.user = { ...data };
  }
};

export const actions = {
  setData({ commit }, data) {
    commit("setData", data);
  }
};
