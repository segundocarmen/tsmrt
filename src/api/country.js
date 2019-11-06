export const apiCountryList = (axios, id) => {
  return axios.$get(`/api/country/find-all-by-id-country`, id);
};

export const apiCountryDetail = (axios, id) => {
  return axios.$get(`/api/country/find-by-id/${id}`);
};

export const apiCountryForAdmin = (axios, { countries, role, skip, limit }) => {
  return axios.$post("/api/country/find-all-for-administrator-cms", {
    countries,
    role,
    skip,
    limit
  });
};

export const apiCountryCreate = (
  axios,
  { name, code, url, namePeriod, language, numberPeriod, termAndCondition }
) => {
  return axios.$post("/api/country/create-cms", {
    name,
    code,
    url,
    namePeriod,
    language,
    numberPeriod,
    termAndCondition
  });
};

export const apiCountryUpdate = (axios, id) => {
  return axios.$put(`/api/country/update-cms/${id}`);
};

export const apiCountryDelete = (axios, id) => {
  return axios.$delete(`/api/country/delete-cms/${id}`);
};

export const apiCountryTerms = (axios, id) => {
  return axios.$get(`api/country/find-termcondition-by-idcountry/${id}`);
};

export const apiCountryTermsUpdate = (axios, body) => {
  return axios.$put(`api/country/update-term-conditions`, body);
};
