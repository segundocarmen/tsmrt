export const apiTeacherList = ( axios, idCollege, term, skip, limit, sortCode, sortName, sortEmail, sortStatus ) => {
    return axios.$get(`/api/teacher/find-teacher-pagination/${idCollege}/${term}/${skip}/${limit}/${sortCode}/${sortName}/${sortEmail}/${sortStatus}`)
}

export const apiTeacherUpdateStatus = ( axios, { idTeachers, status } ) => {
    return axios.$put('/api/teacher/active-inactive-by-idTeachers-status', { idTeachers, status })
}

export const apiTeacherCreate = ( axios, body ) => {
    return axios.$post('/api/teacher/create', body)
}

export const apiTeacherUploadFile = ( axios, data) => {
    return axios.$put('/api/teacher/upload-massive-teacher', data)
}

export const apiTeacherUpdate = ( axios, body ) => {
    return axios.$put('/api/teacher/update-teacher', body)
}

export const apiTeacherUpdateCourses = ( axios, body ) => {
    return axios.$put('/api/teacher/update-course-dictates-or-dictated', body)
}

export const apiTeacherDetail = ( axios, idTeacher ) => {
    return axios.$get(`/api/teacher/find-teacher-detail-cms/${idTeacher}`)
}

export const apiTeacherDetailCourses = ( axios, idTeacher, isDictates) => {
    return axios.$get(`/api/teacher/find-teacher-detail-courses/${idTeacher}/${isDictates}`)
}

export const apiUpdateImageUrl = ( axios, idTeacher, url ) => {
    return axios.$put('/api/teacher/update-image-url', { idTeacher, url })
}



export const apiFindTeacher = (axios, idCollege, idCourse, term) => {
    return axios.$get(`/api/teacher/find-teacher-with-dictates-for-course-term/${idCollege}/${idCourse}/${term}`)
}