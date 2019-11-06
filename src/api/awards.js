export const apiFindAwards = (
  axios,
  idCountry,
  term,
  skip,
  limit,
  sortName,
  sortDuration,
  sortStatus,
  addStatus
) => {
  return axios.$get(
    `/api/award/find-award-pagination/${idCountry}/${term}/${skip}/${limit}/${sortName}/${sortDuration}/${sortStatus}/${addStatus}`
  );
};
export const apiAwardDetail = (axios, id) => {
  return axios.$get(`/api/award/find-award-update/${id}`);
};
export const apiAwardCreate = (axios, data) => {
  return axios.$post(`/api/award/create`, data);
};
export const apiAwardUpdate = (axios, data) => {
  return axios.$put("api/award/update", data);
};
export const apiAwardWinners = (axios, data) => {
  return axios.$get(`api/competitor/find-all-winners-of-award-in-the-college/
						${data.idAward}/${data.idCollege}/${data.sortFullName}/${data.sortCareer}
						/${data.sortEmail}/${data.sortPoints}`);
};
export const apiUpdateImagesUrl = (axios, idAward, shortUrl, longUrl) => {
  return axios.$put("api/award/update-short-long-url", {
    idAward,
    shortUrl,
    longUrl
  });
};
export const apiUpdateCollegesAward = (axios, data) => {
  return axios.$put("api/award/update-college", data);
};
export const apiUpdateAwardsStatus = (axios, data) => {
  return axios.$put("api/award/active-inactive-by-idAwards-status", data);
};
