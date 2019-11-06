
export const apiRegisterEnrollmentListHistoryAcademic = ( axios ,idStudent,  skip, limit, sortCourse, sortCicle, sortPeriod) => {
    return axios.$get(`/api/register-enrollment/find-academic-history-pagination/${idStudent}/${skip}/${limit}/${sortCourse}/${sortCicle}/${sortPeriod}`)
}