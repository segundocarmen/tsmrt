export const apiAuthLogin = (axios, data, cancelToken) => {
  return axios.$post("/api/authentication/login-cms", data, { cancelToken });
};
export const apiAuthLogOut = (axios, { id, system }) => {
  axios
    .$put("/api/authentication/login-out", { id, system })
    .then(function(response) {
      return response;
    })
    .catch(function(error) {
      return error;
    });
};
export const apiAuthValidateCode = (
  axios,
  { idAccount, idCountry, emailRequest, code, type }
) => {
  return axios.$post("/api/authentication/validate-code", {
    idAccount,
    idCountry,
    emailRequest,
    code,
    type
  });
};
export const apiAuthUpdatePassword = (axios, { email, password }) => {
  return axios.$put("/api/authentication/update-password", { email, password });
};
