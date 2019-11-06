export const apiCollegeList= (axios, idCountry, term, skip, limit) => {
    return axios.$get(`/api/college/find-colleges-by-idcountry-term-white-pagination/${idCountry}/${term}/${skip}/${limit}`)
}
export const apiCollegeDetail = (axios, id) => {
    return axios.$get(`/api/college/detail-by-id/${id}`)
}
export const apiCollegeCreate = (axios, body) => {
    return axios.$post('/api/college/create', body)
}
export const apiCollegeUpdate = (axios, body) => {
    return axios.$put(`/api/college/update`, body)
}
export const apiCollegeUpdateStatus = (axios, idCollege, status) => {
    return axios.$put(`/api/college/active-inactive-by-idCollege-status`, {idCollege, status})
}
export const apiCollageTimeZone = ( axios, id ) => {
    return axios.$get(`/api/country/find-all-time-zones-idcountry/${id}`)
}
export const apiCollageDetailForEdit = ( axios, id ) => {
    return axios.$get(`/api/college/find-by-idcollege/${id}`)
}
export const apiCollageUniversityforStatus = ( axios, data ) => {
    return axios.$get(`/api/college/find-colleges-by-idcountry-status/${data.idCountry}/${data.idAward}/${data.status}`)
}