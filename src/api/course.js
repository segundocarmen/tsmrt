export const apiFindCourses = (axios, idCollege, term, skip, limit, sortCode, sortName, sortStatus) => {
    return axios.$get(`/api/course/find-course-pagination/${idCollege}/${term}/${skip}/${limit}/${sortCode}/${sortName}/${sortStatus}`)
}

export const apiCourseTeachersByCourse = (axios, id, term) => { //Todos los profesores que enseñan el mismo curso
    if(!term) term = ''
    return axios.$get(`/api/course/find-teacher-cms/${id}/${term}`)
}

export const apiCoursesForCareer = (axios, id, term) => {
    if(!term) term = ''
    return axios.$get(`/api/course/find-career-cms/${id}/${term}`)
}

export const apiCourseDetail = (axios, id) => {
    return axios.$get(`/api/course/find-courses-detail-cms/${id}`)
}

export const apiCourseDetailTeacher = (axios, idCourse, skip, limit, sortFirstName, sortStatus) => {
    return axios.$get(`/api/course/find-courses-detail-teacher-cms/${idCourse}/${skip}/${limit}/${sortFirstName}/${sortStatus}`)
}

export const apiCourseCreate = (axios, { name, code , careers, idCollege, teachers }) => {
    return axios.$post('/api/course/create-cms', { name, code , careers, idCollege, teachers })
}

export const apiCourseUpdate = (axios, body) => {
    return axios.$put('/api/course/update', body)
}

export const apiCourseTest = (axios, id) => {
    return axios.$post(`/api/course/test-test-test/${id}`)
}

export const apiFindCourseForCareerByTerm = (axios, idCollege, term ) => {
    return axios.$get(`/api/course/find-course-for-career/${idCollege}/${term}`)
}

export const apiCourseDictadesOrDictated = ( axios, idCollege, idTeacher, term, dictates ) => {
    return axios.$get(`/api/course/find-courses-by-idCollege-idteacher-term-dictates/${idCollege}/${idTeacher}/${term}/${dictates}`)
} 

export const apiCourseActiveInactive = ( axios, data) => {
    return axios.$put('/api/course/active-inactive-by-idcourses-status', data)
}
export const apiCourceUploadFile = ( axios, data) => {
    return axios.$put('/api/course/upload-massive-course', data)
}