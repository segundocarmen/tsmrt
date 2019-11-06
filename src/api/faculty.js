export const apiFacultiesList= (axios, idCollege) => {
    return axios.$get(`/api/faculty/find-faculties-by-idCollege/${idCollege}`)
}
export const apiFacultiesUpdate = (axios, data) => {
    return axios.$post(`/api/faculty/insert-update-delete`, data)
}