export const apiSuggestUniversity = ( axios, idCountry, term ) => {
    if(!term) term = 0
    return axios.$get(`/api/suggest/find-college-suggest-idCountry-and-name/${idCountry}/${term}`)
}

export const apiSuggestListUniversity = ( axios, idCountry, skip, limit, sortName, sortCountVote ) => {
    return axios.$get(`/api/suggest/find-suggest-pagination/${idCountry}/${skip}/${limit}/${sortName}/${sortCountVote}`)
}