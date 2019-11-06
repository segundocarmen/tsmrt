<template lang="pug">
    ul.carrer__list-container
        h3.subtitle__blue-general.cicle__subtitle.f16 {{ name }}
        ul.career__items
            li.blue__item-list.h24(v-for="(element, index) in  elementsSelected", :key="index" v-if="element.typeOperation !== 3") 
                p.blue__item-lastname {{ element.name }}
                i.icon-ic-cross-normal(v-on:click="deleteItem({data: element, position: index})")
            li.multiple__select-input
                el-select(
                    v-model='select', 
                    multiple='', 
                    filterable='', 
                    remote='', 
                    placeholder='Agregar curso a ciclo',
                    :loading='loading'
                    @change="addCard"
                    :clearable="true"
                    :remote-method='remoteMethod'
                    value-key="name"
                    reserve-keyword
                    ref="addCard"
                )
                    el-option(v-for='(item, index) in listCourses', :key="item.idCourse", :label='item.name', :value='item')
</template>
<script>
    import { crudStatus } from '~/enums'

    export default {
        props: [
            'cicle', 'listCourses', 'name', 'elementsSelected', 'type'
        ],
        data(){
            
            return {
                select: [],
                loading: false,
                nameData: '',
                status: crudStatus.CREATED
            }
        },
        methods: {
            addCard(val){
                let course = val[val.length -1]
                this.elementsSelected.push({name: course.name, code: course.code, idCourse: course.idCourse, typeOperation: crudStatus.CREATED})

                let cicleData = {
                    cicle: this.cicle,
                    course : this.select
                }
                this.select = []
                this.$emit('studyPlan', cicleData)
                this.$refs.addCard.query = ''
                this.$store.commit('course/setListCourse', [])
            },
            deleteItem(val){
                let position
                this.elementsSelected.forEach((item, i) => {
                    if(item.name == val.data.name) {
                        position = i
                        return
                    } 
                })
                if(val.data.typeOperation == 1) {
                    this.elementsSelected.splice( position, 1 )
                } else {
                    this.elementsSelected[val.position] = {
                        name: val.data.name,
                        code: val.data.code,
                        idCourse: val.data.idCourse,
                        typeOperation: crudStatus.DELETED
                    }
                }
                this.select = []
                this.$emit('deleteItem', {data: val, position: this.cicle, type: this.type})
            },
            remoteMethod(query) {
                if (query !== '') {
                    this.loading = true
                    setTimeout(async() => {
                        this.$emit('remoteMethod', query)
                    }, 200)
                }
                this.loading = false
            }
        },
        mounted() {
            this.$nextTick(function () {
                this.nameData = this.name
            })
        }
    }
</script>
<style lang="sass">
.carrer__list-container
    .subtitle__blue-general
        margin-bottom: 14px !important
    .multiple__select-input .el-input input 
        max-width: 147px
    ::-webkit-input-placeholder  /* Chrome/Opera/Safari */
        color: #909399  
        font-size: 10px
        line-height: 10px
        font-weight: normal
    ::-moz-placeholder  /* Firefox 19+ */
        color: #909399  
        font-size: 10px
        line-height: 10px
        font-weight: normal
    :-ms-input-placeholder  /* IE 10+ */
        color: #909399  
        font-size: 10px
        line-height: 10px
        font-weight: normal
    :-moz-placeholder /* Firefox 18- */
        color: #909399  
        font-size: 10px
        line-height: 10px
        font-weight: normal
    input
        line-height: 8px
        font-family: "Open Sans"
</style>

