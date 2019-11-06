<template lang="pug">
    .request__style
        h4.title__state-back Solicitudes de Universidades
        div(v-if="list != 0")
            el-table.general__table(
                ref='multipleTable', 
                :data="list"
                style='width: 100%'
                @sort-change="sortChange"
            )
                el-table-column( sortable="custom", property='name' label='Nombre de Universidad' label-class-name="labelForDate")
                el-table-column( align="center", sortable property='countVotes', label='Número de Votaciones ')
            pagination.course__pagination(
                v-if="showPagination"
                :currentPage="currentPage"
                :pageSize="pageSize"
                :pageCount="pageCount"
                layout="prev, pager, next, jumper"
                :total="total"
                @currentPage="pagination"
            )
        div.message__no-data(v-else)
            h3 {{ notData }}
</template>

<script>
import pagination from '~/components/shared/pagination'
import { mapState } from 'vuex'

export default {
    layout: 'country',
    components:{
        pagination
    },
    head: {
        title: 'Solicitudes'
    },
    async fetch({store, params, query}) {
        try {
            let pageConditional = query.page ? Number(query.page) : 1
            store.commit('request/setPagination', pageConditional)
            await store.dispatch('request/getList', params.country)
        } catch(error) {
            store.dispatch('catchError', error)
        }
    },
    data() {
        return {
            showPagination: true,
            notData: 'No tienes solicitudes de universidades'
        }
    },
    computed: {
        ...mapState({
            list: state => state.request.list,
            pageSize: state => state.request.limit,
            pageCount: state => state.request.totalPage,
            total: state => state.request.totalRequest,
            currentPage: state => state.request.page
        })
    },
    methods: {
        async pagination(val) {
            this.$store.commit('request/setPagination', val)
            await this.$store.dispatch('request/getList', this.$route.params.country)
            this.$router.push({
                query: {page : val}
            })
        },
        async sortChange(val) {
            let isAscending = val.order == "ascending" ? 1 : -1
            let name 

            switch(val.prop) {
                case 'name':
                    name = 'sortName'; break
                default:
                    name = 'sortCountVote';
            }
            this.$store.commit('request/setSortList', {
                name,
                isAscending
            })
            await this.$store.dispatch('request/getList', this.$route.params.country)
        }
    }
}
</script>
<style lang="sass">
    .request__style
        .labelForDate
            padding-left: 25px !important
        .el-table
            tbody
                td:first-of-type
                    padding-left: 40px !important
            td
                padding: 16px 0
        .message__no-data
            margin-top: 110px
</style>

