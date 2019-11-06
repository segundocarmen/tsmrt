import {
  BadRequestError,
  InternalServerError,
  UnknownError,
  UnauthorizedError,
  GatewayTimeoutError,
  ForbiddenError
} from "~/errors";
import axios from "axios";

export const state = () => ({
  title: null,
  serverErrorMessage: null,
  cancellationTokenSource: null
});

export const mutations = {
  setTitle(state, title) {
    state.title = title;
  },
  setServerErrorMessage(state, serverErrorMessage) {
    state.serverErrorMessage = serverErrorMessage;
  },
  setCancellationTokenSource(state, cancellationTokenSource) {
    state.cancellationTokenSource = cancellationTokenSource;
  }
};

export const actions = {
  async nuxtServerInit(
    { rootState, dispatch, commit },
    { $axios, redirect, params }
  ) {
    try {
      const { country: countryId, university: universityId } = params;

      const cookieValue = this.$readAuthCookie();
      if (cookieValue) {
        commit("account/authentication/setToken", cookieValue.token, {
          root: true
        });
        commit("account/user/setData", cookieValue, { root: true });

        //SETEA PAIS Y UNIVERSIDAD SELECCIONADA
        if (countryId) {
          await dispatch("country/getDetail", countryId);
          if (universityId) {
            await dispatch("university/getDetail", universityId);
          }
        }
        // else this.$router.replace({ path: '/error' })
      }
      if (!rootState.account.authentication.token) redirect("/");
    } catch (error) {
      //console.log(error, "nuxtServerInit");
      dispatch("catchError", error);
    }
  },

  catchError({ commit, dispatch, state }, error) {
    if (error instanceof BadRequestError) {
      this.$alertModal("Parametros invalidos", JSON.stringify(error.data));
      dispatch(
        "alert-modal/open",
        { title: "Parametros invalidos", message: JSON.stringify(error.data) },
        { ROOT: true }
      );
    } else if (error instanceof UnauthorizedError) {
      this.$alertModal("No autorizado", "Vuelve a logearte");
    } else if (error instanceof ForbiddenError) {
      this.$alertModal(
        "Permisos suficientes!",
        "Lo sentimos, pero por el momento no puedes proceder con la acción"
      );
    } else if (error instanceof InternalServerError) {
      if (process.client)
        this.$alertModal(
          "Ocurrio un error en el servidor",
          `${error.message}`,
          error.stack || ""
        );
      else
        commit(
          "setServerErrorMessage",
          `Ocurrio un error en el servidor: ${error.message}`
        );
    } else if (error instanceof GatewayTimeoutError) {
      if (process.client)
        this.$alertModal(
          `Error de conexión`,
          "Por el momento no podemos conectarnos a los servicios del sistema"
        );
      else
        commit(
          "setServerErrorMessage",
          "Por el momento no podemos conectarnos a los servicios del sistema"
        );
    } else if (error instanceof UnknownError) {
      this.$alertModal(
        "Ocurrio un error con su solicitud",
        error.message || ""
      );
    } else {
      if (state.cancellationTokenSource) console.log("error", error);
      else this.$alertModal("Error", `${error.message}`, error.stack || "");
    }
  },
  getCancellationToken({ commit }) {
    const source = axios.CancelToken.source();
    commit("setCancellationTokenSource", source);
    return source.token;
  },
  cancelRequest({ commit, state }) {
    if (!state.cancellationTokenSource) return;
    state.cancellationTokenSource.cancel();
    commit("setCancellationTokenSource", null);
  }
};
