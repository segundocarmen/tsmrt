export const apiLocationsList= (axios, idCollege) => {
    return axios.$get(`/api/location/find-locations-for-college/${idCollege}`)
}
export const apiLocationsUpdate = (axios, data) => {
    return axios.$post(`/api/location/insert-update-delete`, data)
}