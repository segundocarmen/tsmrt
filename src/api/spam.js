export const apiComentarioSpamList = (
  axios,
  idCollege,
  term,
  skip,
  limit,
  sortStudent,
  sortTeacher,
  sortReport,
  addStatus
) => {
  return axios.$get(
    `api/comment/find-comment-spam-pagination/${idCollege}/${term}/${skip}/${limit}/${sortStudent}/${sortTeacher}/${sortReport}/${addStatus}` ///${addStatus}
  );
};

export const apiComentarioSpamDetail = (axios, idDocument) => {
  return axios.$get(`api/comment/find-comment-detail-by/${idDocument}`);
};

export const apiDislikeComentarioSpam = (axios, idDocument) => {
  return axios.$get(`api/comment/find-document-details/${idDocument}`);
};

export const apiCleanComentarioSpam = (axios, data) => {
  return axios.$put(`api/comment/cleaner-or-block-spam`, data);
};

export const apiBlockComentarioSpam = (axios, data) => {
  return axios.$put(`api/comment/cleaner-or-block-spam`, data);
};
