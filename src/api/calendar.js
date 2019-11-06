export const apiCalendarDetail = (axios, idCollege) => {
    return axios.$get(`/api/calendar/find-calendars-for-college/${idCollege}`)
}

export const apiCalendarPeriodsList = (axios, idCollege ) => {
    return axios.$get(`/api/calendar/find-name-periods-for-college/${idCollege}`)
}

export const apiCalendarEdit = (axios, idCollege, periods ) => {
    return axios.$post('/api/calendar/insert-update-delete', { idCollege, periods })
}