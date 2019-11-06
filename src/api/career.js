export const apiCareerByIdCollege = (axios, idCollege, term, nPerPage, pageNumber, sortName) => {
    return axios.$get(`/api/career/find-career-pagination/${idCollege}/${term}/${nPerPage}/${pageNumber}/${sortName}`)
}
export const apiCareerList = (axios, idCollege, term, nPerPage, pageNumber) => {
    return axios.$get(`/api/career/find-career-pagination/${idCollege}/${term}/${nPerPage}/${pageNumber}`)
}
export const apiCareerDetail = (axios, id) => {
    return axios.$get(`/api/career/find-career-by-id/${id}`)
}
export const apiCareerCreate = (axios, { name, code, countCicles, isCicleZero, idCollege, idFaculty, studyPlan }) => {
    return axios.$post('/api/career/create-career', { name, code, countCicles, isCicleZero, idCollege, idFaculty, studyPlan })
}
export const apiCareerCreateHeader = (axios, { name, code, countCicles, isCicleZero, faculty, studyPlan }) => {
    return axios.$post('/api/career/create-career-header', { name, code, countCicles, isCicleZero, faculty, studyPlan })
}
export const apiCareerEditBody = (axios, { name, code, countCicles, isCicleZero, faculty, studyPlan }) => {
    return axios.$put(`/api/career/edit-career-body-by-id`, { name, code, countCicles, isCicleZero, faculty, studyPlan })
}
export const apiCareerEditHeader = (axios, { name, code, countCicles, isCicleZero, faculty, studyPlan }) => {
    return axios.$put(`/api/career/update-career-header/`, { name, code, countCicles, isCicleZero, faculty, studyPlan })
}
export const apiCareerFacultiesByIdCollege = (axios, id) => {
    return axios.$get(`/api/career/find-faculties-by-idcollege-cms/${id}`)
}
export const apiCareerCourseList = (axios, id) => {
    return axios.$get(`/api/career/find-course-by-idcareer/${id}`)
}
export const apiFindPlanStudyCareer = (axios, id) => {
    return axios.$get(`/api/career/find-plan-study-career/${id}`)
}
export const apiFindCareerByTerm = (axios, idCollege, term) => {
    return axios.$get(`/api/career/find-career-by-term-cms/${idCollege}/${term}`)
}

export const apiUpdateCareer = (axios, body) => {
    return axios.$put(`/api/career/update`, body)
}