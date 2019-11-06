export const apiDocumentList = (
  axios,
  idCollege,
  term,
  skip,
  limit,
  sortTitle,
  sortAuthor,
  sortReport,
  sortStatus,
  sortLike,
  sortDislike
) => {
  return axios.$get(
    `api/document/find-document-pagination/${idCollege}/${term}/${skip}/${limit}/${sortTitle}/${sortAuthor}/${sortReport}/${sortStatus}/${sortLike}/${sortDislike}`
  );
};

export const apiDocumentDetail = (axios, idDocument) => {
  return axios.$get(`api/document/find-document-details/${idDocument}`);
};

export const apiDocumentListSpam = (
  axios,
  idCollege,
  term,
  skip,
  limit,
  sortTitle,
  sortAuthor,
  sortReport,
  sortStatus
) => {
  return axios.$get(
    `api/document/find-document-spam-pagination/${idCollege}/${term}/${skip}/${limit}/${sortTitle}/${sortAuthor}/${sortReport}/${sortStatus}`
  );
};

export const apiBloqDocument = (axios, data) => {
  return axios.$put("api/document/cleaner-or-block", data);
};
