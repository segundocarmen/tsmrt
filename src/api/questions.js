export const apiQuestionsList = (
  axios,
  idCollege,
  term,
  skip,
  limit,
  sortQuestion,
  sortLevel,
  sortDate,
  addStatus
) => {
  ///${addStatus}
  return axios.$get(
    `/api/question/find-question-pagination/${idCollege}/${term}/${skip}/${limit}/${sortQuestion}/${sortLevel}/${sortDate}/${addStatus}`
  );
};

export const apiQuestionsDetail = (axios, idQuestion) => {
  return axios.$get(`/api/question/find-question-update/${idQuestion}`);
};

export const apiQuestionsUpdate = (axios, data) => {
  return axios.$put("/api/question/update", data);
};

export const apiQuestionsDelete = (axios, data) => {
  return axios.$delete("/api/question/delete", { data });
};

export const apiUploadMasiveQuestion = (axios, data) => {
  return axios.$post("/api/question/upload-massive-question", data);
};
