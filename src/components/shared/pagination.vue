<template lang="pug">
    el-pagination.pagination(
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :page-count="pageCount"
        :layout="layout"
        :total="total"
        ref="pagination"
    )
</template>

<script>
import {onlyNumbersMixin} from '~/mixins'

export default {
    mixins: [ onlyNumbersMixin ],
    props: ['pageSize', 'layout','total', 'pageCount', 'currentPage'],
    data() {
        return {
            page: this.currentPage,
        }
    },
    methods: {
        handleCurrentChange(val) {
            this.$emit('currentPage',  val)
            console.log(`Page number ${val}`)
        }
    },
    async mounted() {
        this.$nextTick(() => {
            this.$refs.pagination.$el.querySelector('input').addEventListener('keypress',this.onlyNumbers)
        })
    },
    beforeDestroy() {
        this.$refs.pagination.$el.querySelector('input').removeEventListener('keypress', this.onlyNumbers)
    }

}
</script>

<style lang="sass">
    .pagination
        text-align: center
        padding-top: 150px
        position: relative
        // padding-bottom: 45px
        .el-pager .number,
        .el-pager .more,
        .btn-prev,
        .btn-next
            background-color: transparent !important
        .number 
            font-size: 14px
            font-weight: 600
            min-width: 45px

        .is-in-pagination
            .el-input__inner
                width: 36px
                height: 20px
                background-color: rgba(255,255,255,0.5)
                color: $gray
                font-weight: 600
                color: #415061
        .el-icon-arrow-left
            &:before
                font-family: "fontastic" !important
                content: 'e'
                font-size: 11px
                padding-right: 0
        .el-icon-arrow-right
            &:before
                font-family: "fontastic" !important
                content: 'E'
                font-size: 11px
                padding-left: 0

</style>




