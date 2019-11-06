<template lang="pug">
    div
        ul.courses__list-container(v-if="conditional")
            li.blue__item-list(v-for="(item, i) in  list", :key="i" v-if="item.typeOperation !== 3") 
                p.blue__item-lastname(v-if="conditional") {{ item.value ? item.value.lastname : '--' }}
                p.blue__item-name(v-if="conditional") {{ item.value ? item.value.name : '--'}}
                i.icon-ic-cross-normal(v-on:click="deleteItem({item, i})")
            li.multiple__select-input
                el-select(
                    v-model='select' 
                    multiple=''
                    filterable='' 
                    :remote="true"
                    reserve-keyword
                    placeholder='Agregar profesores al curso'
                    :remote-method='remoteMethod'
                    :loading='loading'
                    @change="addItem"
                    value-key="label"
                    ref="teacher"
                    loading-text="Cargando"
                )
                    el-option(v-for='(item, index) in listOptions', :key="item.id", :label='item.label', :value='item')
        .course_career-box(v-else)
            li.blue__item-list(v-for="(associate, index)  in list"  v-if="associate.typeOperation !== 3") 
                p.blue__item-lastname {{ associate.career }}
                p.blue__item-name {{ associate.cicle }}
                i.icon-ic-cross-normal(v-on:click="deleteItem({associate, index})")
    
    </template>

<script>
    import { crudStatus } from '~/enums'

    export default {
        props: [
            'list', 'listOptions', 'placeholder', 'type'
        ],
        data(){
            return {
                select: [],
                loading: false,
                conditional: Boolean(this.type),
                status: crudStatus.DELETED
            }
        },
        methods: {
            addItem(val){
                console.log(val)
                this.$emit('addItem', val)
                this.select = []
            },
            deleteItem(val){
                this.select.splice(val, 1)
                this.$emit('delete', val)
            },
            remoteMethod(query) {
                this.$emit('remoteMethod', query)
            }
        },
        mounted() {
            this.conditional = this.type == 'teacher' ? true : false
        }
    }
</script>