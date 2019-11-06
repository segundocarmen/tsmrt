export const apiStudentList = ( axios ,idCollege, term, skip, limit, sortDate, sortName, sortEmail, sortStatus, sortValidate) => {
    return axios.$get(`/api/student/find-student-pagination/${idCollege}/${term}/${skip}/${limit}/${sortDate}/${sortName}/${sortEmail}/${sortStatus}/${sortValidate}`)
}

export const apiStudentDetail = ( axios, idStudent ) => {
    return axios.$get(`/api/student/find-student-detail-by-idStudent/${idStudent}`)
}

export const apiStudentUpdateStatus = ( axios, body) => {
    return axios.$put(`/api/student/active-inactive-by-idStudents-status`, body)
}

export const apiStudentFindByTerm = ( axios ) => {
    return
}

export const apiStudentValidEmailCollege = ( axios, data ) => {
    return axios.$put(`/api/student/validate-email-college`, data)
}

export const apiStudentEmbassadorWabu = ( axios, data ) => {
    return axios.$put(`/api/student/ambassador-wabu`, data)
}

export const apiStudentFindForUpdate = ( axios, idStudent) => {
    return axios.$get(`/api/student/find-student-for-update-by-idStudent/${idStudent}`)
}

export const apiStudentUpdate = ( axios, data ) => {
    return axios.$put(`/api/student/update`, data)
}