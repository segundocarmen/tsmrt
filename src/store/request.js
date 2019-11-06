import { apiSuggestListUniversity } from '../api/suggest'
import { sort } from '~/enums' 

export const state = () => ({
    list: [],
    limit: 10,
    totalPage: 2,
    totalRequest: 12,
    page: 1,
    sortName: sort.ASC,
    sortCountVote: 0,
    listCareers: [
        { id:'19h3', name: 'Arquitectura', votesNumber: '500' },
        { id:'wjxowee', name: 'Arte y moda', votesNumber: '400' },
        { id:'2432rdas', name: 'Ciencia Política', votesNumber: '348' },
        { id:'sfsds', name: 'Contabilidad', votesNumber: '906' },
        { id:'3534t', name: 'Danza', votesNumber: '120' }
    ],
    listCourses: [
        { id:'cdszcs', code: 'CUP0775', type: 'Curso Existente - Carrera', votesNumber: '30' },
        { id:'etgv', code: 'CUP0775', type: 'Curso Existente - Carrera', votesNumber: '10' },
        { id:'y7vcs', code: 'CUP0775', type: 'Curso Existente - Otra carrera', votesNumber: '10' },
        { id:'45ynf', code: 'CUP0775', type: 'Curso Nuevo - Carrera', votesNumber: '08' },
        { id:'e343fc', code: 'CUP0775', type: 'Curso Existente - Carrera', votesNumber: '05' },
        { id:'345rfcsd', code: 'CUP0775', type: 'Curso Nuevo - Carrera', votesNumber: '19' },
    ],
    listTeachers: [
        { id:'w43ewds', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Existente - Curso Nuevo', votesNumber: '30' },
        { id:'434', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Existente - Curso Existente', votesNumber: '10' },
        { id:'erew', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Nuevo - Curso Existente', votesNumber: '70' },
        { id:'35c', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Existente - Curso Nuevo', votesNumber: '35' },
        { id:'5ihm', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Existente - Curso Existente', votesNumber: '71' },
        { id:'457om', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Existente - Curso Existente', votesNumber: '99' },
        { id:'68inv', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Nuevo - Curso Existente', votesNumber: '03' },
        { id:'4547j', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Nuevo - Curso Existente', votesNumber: '36' },
        { id:'yumfo', email: 'alejandro.rodriguez@pucp.com.pe', type: 'Profesor Nuevo - Curso Existente', votesNumber: '39' },
    ]
})

export const mutations = {
    setList(state, data) {
        state.list = data.colleges,
        state.totalRequest = data.countRecord
        state.totalPage = data.countPage
    },
    setPagination(state, page) {
        state.page = page
    },
    
    setSortList(state, { name, isAscending }) {
        state.sortName = 'sortName' == name ? isAscending : 0
        state.sortCountVote = 'sortCountVote' == name ? isAscending : 0
    }
}

export const actions = {
    async getList({commit, state}, idCountry) {
        try {
            let response = await apiSuggestListUniversity(this.$axios, idCountry, state.page, state.limit, state.sortName, state.sortCountVote)
            commit('setList', response)
        } catch(error) {
            commit('setList', [])
        }
        
    }
}