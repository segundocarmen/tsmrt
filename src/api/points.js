export const apiPointList = (
  axios,
  idCollege,
  skip,
  limit,
  sortDescription,
  sortPoint
) => {
  return axios.$get(
    `api/point/find-point-pagination/${idCollege}/${skip}/${limit}/${sortDescription}/${sortPoint}`
  );
};

export const apiPointUpdate = (axios, data) => {
  return axios.$put("api/point/update", data);
};

export const apiFindQuantityPoints = (axios, data) => {
  //return axios.$put("api/point/update", data);
};
