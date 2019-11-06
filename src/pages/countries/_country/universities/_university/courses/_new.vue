<template lang="pug">
    div.new_course
        h4.title__state-back
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            | {{ title }}
        el-form(ref="form", :model="form", label-width="120px").pb-80
            .courses__input-ctn
                el-form-item.margin-right(label="Nombre", :error="nameErrorMessages[0]")    
                    el-input(
                        class="name"
                        v-model.trim="form.name", 
                        @input="$v.form.name.$touch()"
                        maxLength="50"
                        
                    )
                el-form-item.text_uppercase(label="Código", :error="codeErrorMessages[0]")
                    el-input(
                        class="code"
                        v-model.trim="form.code",
                        @input="$v.form.code.$touch()"
                        maxLength="8"
                        @keypress.native="codeKeyPress"
                    )
            h3.subtitle__blue-general Profesores del Curso
            
            blueTab(
                :list="teacherList", 
                :listOptions="filterTeacher",
                placeholder="Agregar profesores al curso"
                @delete="deleteTeacher"
                @addItem="addTeacher"
                @remoteMethod="remoteMethod"
                type="teacher"
                ref="teacher"
            )
            h3.subtitle__blue-general Carreras Asociadas
            .course_career-add
                el-form-item.margin-right(label='Carrera')
                    el-select(
                        v-model='associate', 
                        filterable='', 
                        remote='',
                        :remote-method='remoteCareer', 
                        :loading="loading"
                        reserve-keyword
                        value-key="name"
                        placeholder=""
                    )
                        el-option(v-for='(item, index) in filterCareers', :key="item.id", :label='item.name', :value='item')
                el-form-item(label='Ciclo')
                    el-select(v-model='cicle', placeholder='Seleccione' value-key="id" )
                           
                        el-option( v-for= "(item, index) in cicleSelectData", :key="index", :label='item.name', :value='item' )
                el-button.add__button--course(@click="addCareer( { associate, cicle })"  :disabled="!addCareerButton"  ) AGREGAR  

            blueTab(
                :list="associateCarrers", 
                :listOptions="filterTeacher",
                placeholder="Agregar profesores al curso"
                @delete="deleteCareer"
                @addItem="addTeacher"
                @remoteMethod="remoteMethod"
                :loading="loading"
                type="Career"
                ref="career"
                )
            footerEdit(@cancel="cancel" @save="submit()",  :disabled="btnDisabled",  :errorMessage="errorMessage")
            confirmModal(ref="confirmModal" @save="saveData")
</template>
<script>
import footerEdit from '~/components/shared/footer-edit'
import confirmModal from '~/components/modals/general'
import blueTab from '~/components/courses/blue-tab'
import { required, minLength } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'
import { crudStatus, isDictates } from '~/enums'
import { mapState } from 'vuex'
import { lettersAndNumbersMixin, dontAllowSpacesMixin } from '~/mixins'
import { GatewayTimeoutError } from '~/errors'

export default {
    mixins: [lettersAndNumbersMixin, dontAllowSpacesMixin],
    layout: 'university',
    components:{
        footerEdit,
        confirmModal,
        blueTab
    },
    head() {
        return {
            title: this.title
        }
    },
    validations: {
        form: {
            name: {
                required,
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^0-9-A-Za-zÀ-ÖØ-öø-ÿÑñâêîôû\s]/.test(value)
                )
            },
            code: {
                required,
                minLength: minLength(3),
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^0-9-a-zA-ZÑñ\s]/.test(value)
                )
            }
        }
    },
    async fetch({store, params, query}) {
        try {
            if(params.new == 'edit') {
                await store.dispatch('course/getDetail', query.idCourse)
            }   
        } catch(error) {
            store.dispatch('catchError', error)
        }
    },
    data(){
        let country = this.$route.params.country
        let university = this.$route.params.university
        let idCourse = this.$route.query.idCourse ? this.$route.query.idCourse : 0
        let page = this.$route.query.page ? `?page=${this.$route.query.page}` : ''
        let backPage = this.$route.params.new == 'edit'? `/countries/${country}/universities/${university}/courses/detail?id=${this.$route.query.idCourse}&page=${this.$route.query.page}` : `/countries/${country}/universities/${university}/courses${page}`
        return {
            form: {
                name: "",
                code: ""
            },
            associate: [],
            teacher: '',
            list: [],
            careerList: [],
            loading: false,
            cicle: "",
            cicleSelectData: [],
            career: "",
            associateCarrers: [],
            teacherList: [],
            addCareerButton: false,
            errorMessage: '',
            prevPage: backPage,
            collegeSelect: '',
            title: '',
            prevName: '',
            prevCode: '',
            btnEdit: '',
            isSameCareer: '',
            isSameTeacher: '',
            isNewCourse: false,
            timeout: null,
            idCourse
        }
    },
    methods: {
        cancel() {
            if(this.isNewCourse) this.$refs.confirmModal.open('icon-ic-cursos', '¿Estás seguro que deseas cancelar la creación del nuevo curso?', this.prevPage)
            else this.$refs.confirmModal.open('icon-ic-cursos', '¿Estás seguro que deseas cancelar la edición de este curso?', this.prevPage)   
        },
        remoteMethod(query) {
            if (query !== '') {
                this.loading = true
                clearTimeout(this.timeout)

                this.timeout = setTimeout(async() => {
                    this.loading = false;
                    await this.$store.dispatch('teacher/findTeachersByCourse', {
                        idCollege: this.collegeSelect.university,
                        idCourse: this.idCourse,
                        term: query
                    })
                    this.loading = false
                }, 200)
                
            } else {
                this.$store.commit('teacher/setComboTeachersByCourse', [])
            }
        },
        async remoteCareer(query){
            if (query !== '') {
                this.loading = true
                clearTimeout(this.timeout)

                this.timeout = setTimeout(async() => { 
                    await this.$store.dispatch('career/findCareerForCourses', {
                        id: this.collegeSelect.university,
                        term: query
                    })
                    this.loading = false
                })
            } else {
                this.options5 = []
                this.$store.commit('career/setComboCarrers', [])
            }
        }, 
        addTeacher(val){
            let teacher = JSON.parse(JSON.stringify(val[val.length -1]))
            if(this.teacherList.filter(item => item.id == teacher.id).length) {
                teacher.typeOperation = crudStatus.ORIGINAL
                teacher.isDictates = true
            }

            let newTeacherList = this.teacherList.filter(item => item.id !== teacher.id)

            newTeacherList.push(teacher)

            this.teacherList = newTeacherList 
            this.$store.commit('teacher/setComboTeachersByCourse', [])
            this.$refs.teacher.$children[0].query = ''
            this.changeTeacher()
        },
        deleteTeacher(val){
            if(val.item.typeOperation == 1 ) {
                this.teacherList.splice(this.teacherList.indexOf(val.item),1)
            } else {
                this.teacherList[val.i] = {'id': val.item.id, 'label': val.item.label, 'value' : val.item.value, 'typeOperation': crudStatus.DELETED, isDictates: val.item.isDictates }
                this.$refs.teacher.$forceUpdate()
            }
            this.changeTeacher()
        },
        deleteCareer(val){
            if(val.associate.typeOperation == 1 ) {
                this.associateCarrers.splice(this.associateCarrers.indexOf(val.associate),1)
            } else {
                this.associateCarrers[val.index] = {'career': val.associate.career, 'idCareer': val.associate.idCareer, 'cicle' : val.associate.cicle, 'idCicle':  val.associate.idCicle, 'typeOperation': crudStatus.DELETED }
                this.$refs.career.$forceUpdate()
            }
            this.cicleSelectData = []
            this.changeCareer()
        },
        async addCareer({ associate, cicle }){
            let conditionalTypeOperation = associate.typeOperation

            if(this.associateCarrers.filter(item => (item.idCicle == cicle.id)).length)
                conditionalTypeOperation = crudStatus.ORIGINAL 
                
            let newAssociateCarrers = this.associateCarrers.filter(item => (item.idCicle !== cicle.id))
            newAssociateCarrers.push({'career' : associate.name , 'idCareer': associate.id , 'cicle' :  cicle.name, 'idCicle': cicle.id, typeOperation: conditionalTypeOperation })

            this.associateCarrers = newAssociateCarrers
            this.associate = ""
            this.cicle = ""
            this.addCareerButton = false
            this.cicleSelectData = []
            this.changeCareer()
            this.$store.commit('career/setComboCarrers', [])
        },
        submit(formName){
            this.$v.form.$touch()
            if(!this.$v.form.$invalid) {
                let text = this.$route.params.new == 'edit' ? 'editar la información de' : 'crear'
                this.$refs.confirmModal.open('icon-ic-cursos', `¿Estás seguro que deseas ${text} este curso`)
            }
        },
        changeCareer(val){
            console.log(val)
        },
        async sendData(){
            try {
                await this.$store.dispatch('course/create', {
                    name: this.form.name.trim().replace(/\s+/g, ' '),
                    code: this.form.code.toUpperCase(),
                    idCollege: this.collegeSelect.university,
                    careers: this.associateCarrers.map( item => ({
                        idCareer: item.idCareer,
                        name: item.career,
                        typeOperation: item.typeOperation,
                        studyPlan: {
                            idStudyPlan: item.idCicle,
                            name: item.cicle
                        }
                    })),
                    teachers: this.teacherList.map( item => ({
                        idTeacher: item.id,
                        firstName: item.value.name,
                        lastName: item.value.lastname,
                        typeOperation: item.typeOperation,
                        isDictates: item.isDictates 
                    })),
                })
                this.$router.push(this.prevPage)
            } catch (error) {
                if(!(error instanceof GatewayTimeoutError)) {
                    this.errorMessage = error.message
                    this.prevCode = this.form.code
                    this.btnEdit = true
                } else this.$catchError(error)
            }
            this.$refs.confirmModal.close()
        },
        filter(val) {
            console.log('value:', val)
        },
        actions() {
            switch(this.$route.params.new) {
                case('new'):
                    this.title = 'Nuevo Curso'
                    this.isNewCourse = true
                    break
                case('edit'):
                    this.title = 'Editar Curso'
                    this.isNewCourse = false
                    this.form.name = this.prevName = this.detail.name
                    this.form.code = this.prevCode = this.detail.code
                    this.associateCarrers = this.detail.careers.map(item => ({
                        career: item.name,
                        cicle: item.studyPlan.name,
                        idCareer: item.idCareer,
                        idCicle: item.studyPlan.idStudyPlan,
                        typeOperation: 0
                    }))
                    this.teacherList = this.detailTeachers.map(item => ({
                        id: item.idTeacher,
                        label: item.firstName + ' ' + item.lastName,
                        value: {
                            lastname: item.lastName,
                            name: item.firstName,
                        },
                        typeOperation: 0,
                        isDictates: item.isDictates
                    }))
                    break
            }
        },
        async editCourse() {
            try {
                await this.$store.dispatch('course/update', {
                    "idCourse": this.$route.query.idCourse,
                    "idCollege": this.$route.params.university,
                    "name": this.form.name.trim().replace(/\s+/g, ' '),
                    "code": this.form.code.toUpperCase(),
                    "teachers": this.teacherList.map( item => {
                        if(item.typeOperation !== crudStatus.DELETED && item.isDictates == isDictates.FALSE)
                            item.typeOperation = crudStatus.UPDATED
                        return {
                            idTeacher: item.id,
                            firstName: item.value.name,
                            lastName: item.value.lastname,
                            typeOperation: item.typeOperation,
                            isDictates: item.isDictates,
                        }
                    }),
                    "careers": this.associateCarrers.map( item => ({
                        idCareer: item.idCareer,
                        name: item.career, 
                        studyPlan: {
                            idStudyPlan: item.idCicle,
                            name: item.cicle
                        },
                        typeOperation: item.typeOperation
                    })),
                })
                this.$router.push(this.prevPage)
            } catch (error) {
                this.errorMessage = error.message
                //this.$catchError(error)
            }
            this.$refs.confirmModal.close()
        },
        saveData() {
            switch(this.$route.params.new) {
                case('new'):
                    this.sendData()
                    break
                case('edit'):
                    this.editCourse()
                    break
            }
        },
        changeTeacher() {
            let data = this.teacherList.filter(item => item.typeOperation == 3 || item.typeOperation == 1)
            this.isSameTeacher = !Boolean(data.length)
        },
        changeCareer() {
            let data = this.associateCarrers.filter(item => item.typeOperation == 3|| item.typeOperation == 1)
            this.isSameCareer = !Boolean(data.length)
        },
        codeKeyPress() {
            this.lettersAndNumbers()
            this.dontAllowSpaces()
        }
    },
    computed: {
        ...mapState({
            listTeachers: state => state.teacher.listTeachersByCourse,
            listCareer: state => state.career.listCareer,
            collegeSelectStore: state => state.university.detail,
            detail: state => state.course.detail,
            detailTeachers: state => state.course.listTeacherByDetail
        }),
        nameErrorMessages() {
            return [
                    !this.$v.form.name.$dirty || this.$v.form.name.required || 'Debes de ingresar un nombre',
                    !this.$v.form.name.$dirty || this.$v.form.name.letters || '*Evita ingresar caracteres especiales'
                ].filter( val => typeof(val) == 'string')
        },
        codeErrorMessages() {
            return [
                    !this.$v.form.code.$dirty || this.$v.form.code.required || 'Debes de ingresar un código',
                    !this.$v.form.code.$dirty || this.$v.form.code.minLength || 'Debes ingresar minimo 3 carácteres',
                    !this.$v.form.code.$dirty || this.$v.form.code.letters || '*Evita ingresar caracteres especiales'
                ].filter( val => typeof(val) == 'string')
        },
        btnDisabled() {
            if(this.$route.params.new == 'edit') {
                return this.btnEdit && this.isSameCareer && this.isSameTeacher || Boolean(this.nameErrorMessages.length) || Boolean(this.codeErrorMessages.length) 
            } else {
                return this.form.code == this.prevCode || !this.$v.form.$dirty || this.$v.form.$error
            }
        },
        multipleListener(){
            return[
                this.associate,
                this.cicle,
            ].join()
        },
        filterCareers() {
            let idSelected = this.associateCarrers.map((item) => { 
                if(item.typeOperation !== crudStatus.DELETED) return item.idCareer 
            })
            return this.listCareer.filter((item, i) => idSelected.indexOf(item.id) ==  -1 )
        },
        filterTeacher() {
            let idSelected = this.teacherList.map((item => {
                if(item.typeOperation !== crudStatus.DELETED) return item.id 
            }))
            return this.listTeachers.filter((item, i) => idSelected.indexOf(item.id) ==  -1)
        },
        multipleListenerForEdit() {
            return[
                this.form.name,
                this.form.code
            ].join()
        }
    },
    watch: {
        multipleListener(){
            if( this.associate && this.cicle){
                this.addCareerButton = true
            }else{
                this.addCareerButton = false
            }
        },
        associate(val) {
            let arrayCicles = []
            if(val)
                if(val.studyPlan.length > 0) {
                    let data  = val.studyPlan.map(item => ({
                        name: item.name,
                        id: item.idStudyPlan
                    }))
                    this.cicleSelectData = data.filter(i => i.name !== "Cursos Adicionales" && i.name !== "Cursos Electivos" && i.name !== "Electivos")
                } else  {
                    this.cicleSelectData = ''
                }
        },
        multipleListenerForEdit(val) {
            if(
                this.form.name == this.prevName &&
                this.form.code == this.prevCode
            ) {
                this.btnEdit  = true
            } else {
                this.btnEdit = false
            }
            if(!this.isNewCourse && this.detailTeachers && this.detail) {
                this.isSameCareer = this.associateCarrers.length == this.detail.careers.length ? true : false
                this.isSameTeacher = this.teacherList.length == this.detailTeachers.length ? true : false
            }
        }
    },
    mounted() {
        this.list = this.listTeachers.map(item => {
            let fullName = item.firstName + ' ' + item.lastName
            return { value: fullName, label: item.firstName };
        });
        this.collegeSelect = this.$route.params
        
        this.$nextTick(() => {
           
        })
    },
    created() {
        this.actions()
    },
}
</script>
<style lang="sass">
    .detail_course
        .title__state-back
            margin-bottom: 35px
    .courses__input-ctn
        .el-form-item
            &:last-child
                    input
                        width: 150px
    .text_capitalize
        .el-input__inner
            text-transform: capitalize
    .text_uppercase
        .el-input__inner
            text-transform: uppercase
</style>

