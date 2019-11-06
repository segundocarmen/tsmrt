<template lang="pug">
       div.add__career
            .title__state-back
                nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
                h1.title {{ title }}
            el-form(ref="form", :model="form", label-width="120px")
                .form__career_row
                    .career__options
                        el-form-item.margin-right(label="Nombre" :error="nameErrorMessages[0]")
                        el-input(
                            v-model.trim="form.name", 
                            @input="$v.form.name.$touch()"
                            maxLength="50"
                        )
                    .career__options
                        em Ciclos
                        .cicle__input
                            el-input-number(
                                v-model='endCicle', 
                                @change='handleChange', 
                                :min='1', 
                                :max='16'
                                :readonly="true"
                            )
                        el-checkbox.checkbox__cicle(v-model="checked") Ciclo 0
                .form__career_row
                    .career__options
                        el-form-item.margin-right(label="Código" :error="codeErrorMessages[0]")
                        el-input.text_uppercase(
                            v-model.trim="form.code", 
                            @input="$v.form.code.$touch()"
                            maxLength="8"
                            @keypress.native="codeKeyPress"
                        )
                    .career__options
                        el-form-item.margin-right(label="Facultad")
                        el-select.select__caret-style(
                            v-model='form.facultad', 
                            placeholder='Seleccione' 
                            @input="$v.form.facultad.$touch()" 
                            value-key="name")
                            el-option(v-for='(item, i) in faculties', :key='item.idFaculty', :label='item.name', :value='item' )
            .subtitle__container
                h3.subtitle__blue-general.f20 Cursos por Carrera
                el-dropdown(dropdown @visible-change="changeDropdown" v-bind:class=" {'is-active-dropdown':  isActive} ").courses__dropdown
                    i.icon-ic-options-normal
                    el-dropdown-menu(slot='dropdown').dropdown--options
                        el-dropdown-item 
                            i.icon-ic-carga-masiva-normal
                            | Carga Masiva
                        el-dropdown-item(divided)
                            i.icon-ic-descarga-plantilla-normal
                            | Descargar plantilla
            card(
                v-for="(cicle, index) in coursesCicleZero", 
                :cicle="index",
                :elementsSelected="cicle.courses",
                :name="cicle.name",
                key="cicleZero", 
                :listCourses="filterCourses",
                :type="typeCicleEnum.ZERO",
                @studyPlan="studyPlanCourses" 
                @remoteMethod="findCourse" 
                @deleteItem="deleteCourse"
                ref="cicleZero"
                v-if="checked")

            card(
                v-for="(cicle, index) in cicles", 
                :cicle="index",
                :elementsSelected="cicle.courses",
                :name="cicle.name",
                :key="index", 
                :listCourses="filterCourses",
                :type="typeCicleEnum.REGULAR",
                @studyPlan="studyPlanCourses" 
                @remoteMethod="findCourse" 
                @deleteItem="deleteCourse"
                ref="cardCicle")

            card(
                v-for="(cicle, i) in coursesElectivos", 
                :cicle="i",
                :elementsSelected="cicle.courses",
                :name="cicle.name",
                :type="typeCicleEnum.ELECTIVE",
                key="Electivos", 
                :listCourses="filterCourses", 
                @studyPlan="studyPlanCourses"
                @remoteMethod="findCourse"
                @deleteItem="deleteCourse"
                ref="aditionals")    
            footerEdit(@cancel="cancel" @save="submit()",  :disabled="btnDisabled",  :errorMessage="errorMessage")
            confirmModal(ref="confirmModal" @save="action")
</template>
<script>
import footerEdit from '~/components/shared/footer-edit'
import card from '~/components/careers/cicle-card'
import confirmModal from '~/components/modals/general'
import { required, alphaNum } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'
import { mapState } from 'vuex'
import { create } from 'domain'
import { crudStatus, typeCicleEnum } from '~/enums'
import { GatewayTimeoutError } from '~/errors'
import { lettersAndNumbersMixin, dontAllowSpacesMixin, onlyLettersMixin } from '~/mixins'

export default {
    mixins: [lettersAndNumbersMixin, dontAllowSpacesMixin, onlyLettersMixin],
    layout: 'university',
    head() {
        return {
            title: this.title
        }
    },
    components: {
        card,
        footerEdit,
        confirmModal
    },
    async fetch({store, params, query}) {
        try {
            if(params.university){
                await store.dispatch('college/faculty/findFacultiesForCollege', params.university)
                if(query.idCareer) {
                    await store.dispatch('career/getDetail', {
                        id: query.idCareer, 
                        page: 'edit'
                    })
                }
            }
        } catch(error) {
            store.dispatch('catchError', error)
        }
    },
    data(){
        let params = this.$route.params
        let query = this.$route.query
        let page = this.$route.query.page ? `?page=${this.$route.query.page}` : ''
        let conditionalReturnPage = params.new == 'edit' ?  `/countries/${params.country}/universities/${params.university}/careers/detail?id=${query.idCareer}&page=${query.page}` : `/countries/${params.country}/universities/${params.university}/careers${page}`
        return { 
            form: {
                name: "",
                code: "",
                facultad: ""
            },
            typeCicleEnum,
			cicles: [],
            //aditionalCourses:[],
            endCicle: 10,
            checked: false,
            prevPage: conditionalReturnPage,
            collegeSelect: '',
            title: '',
            coursesDetail: [],
            prevName: '',
            prevCode: '',
            prevFacultad: '',
            prevEndCicle: '',
            prevChecked: '',
            prevStudyPlan: '',
            btnEdit: '',
            coursesElectivos: [],
            courses: [],
            coursesCicleZero: [],
            changeCicles: true,
            isDeleteCourse: true,
            errorMessage: '',
            isNewCareer: false,
            isActive: ''
        }
    },
    validations:{
        form: {
            name: {
                required,
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^A-Za-zÀ-ÖØ-öø-ÿÑñâêîôû\s]/.test(value)
                )
            },
            code: {
                required,
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^0-9-a-zA-ZÑñ\s]/.test(value)
                )
            },
            facultad: {
                required
            },
        },
        
    },
    computed:{
        ...mapState({
            faculties: state => state.college.faculty.faculties,
            course: state => state.course.listCourses,
            detail: state => state.career.detailForEdit
        }),
        btnDisabled() {
            if(this.$route.params.new == 'edit') {
                let name = Boolean(this.nameErrorMessages.length)
                let code = Boolean(this.codeErrorMessages.length)
                if(name || code ) return true
                else if(
                    this.form.name !== this.prevName || 
                    this.form.code !== this.prevCode || 
                    this.form.facultad !== this.prevFacultad ||
                    this.endCicle !== this.prevEndCicle || 
                    this.checked !== this.prevChecked
                ) return false
                else return this.btnEdit && this.changeCicles && this.isDeleteCourse && !Boolean(this.deletedCycles.length)
            } else {
                return this.form.name == this.prevName || this.form.code == this.prevCode || !this.$v.form.$dirty || this.$v.form.$error
            }
        },
        nameErrorMessages() {
            const errors = []
            if (!this.$v.form.name.$dirty) return errors
            !this.$v.form.name.required && errors.push('*Debes ingresar un Nombre')
            !this.$v.form.name.letters && errors.push('*Evita ingresar números o caracteres especiales')
            // !this.$v.form.name.alphaNum && errors.push('Debes ingresar solo números y letras')
            return errors
        },
        codeErrorMessages() {
            const errors = []
            if (!this.$v.form.code.$dirty) return errors
            !this.$v.form.code.required && errors.push('*Debes ingresar un Código')
            !this.$v.form.code.letters && errors.push('*Evita ingresar caracteres especiales')
            return errors
        },
        filterCourses() {
            let idCoursesSelected = []
            this.cicles.forEach((item, i) => {
                idCoursesSelected.push(item.courses.map(e => e.idCourse))
            })
            let coursesElectivos = this.coursesElectivos.map(item => item.idCourse)
            let selectCourses = [].concat(...idCoursesSelected, coursesElectivos)
            let conditional = this.$route.params.new == 'edit' ? this.courses : this.course
            return conditional.filter((item, i) => selectCourses.indexOf(item.idCourse) ==  -1 )
        },
        multipleListener() {
            return[
                this.form.name,
                this.form.code
            ].join()
        },
        deletedCycles() {
            let ciclesId = this.cicles.map(item => item.idStudyPlan)
            let ciclesDeleted = JSON.parse(JSON.stringify(this.prevStudyPlan.filter(item => ciclesId.indexOf(item.idStudyPlan) == -1)))
            return ciclesDeleted.map(item => {
                item.typeOperation = crudStatus.DELETED
                return item
            })
        }
    },
    methods: {
        remoteMethod(query) {
            if (query !== '') {
                this.loading = true
                setTimeout(async() => {
                    this.findCourse(query)
                }, 200)
            }
            this.loading = false
        },
        remoteMethodZeroCicle(query) {
            if (query !== '') {
                this.loading = true
                setTimeout(async() => {
                    this.findCourse(query)
                }, 200)
            }
            this.loading = false
        },
        addCard(val){
            this.cicles[0].courses = val
            this.$refs.addCard.query = ''
            this.$store.commit('course/setListCourse', [])
        },
        addAditionalCourse(val){
            //this.aditionalCourses = val
            this.$refs.addAditionalCourse.query = ''
            this.$store.commit('course/setListCourse', [])
        },
        
        handleChange(value) {
            let position = this.cicles.indexOf(value)
            if(this.cicles.length  +1 == value){
                this.cicles.push({ name: "Ciclo " + value , courses: [] ,idStudyPlan:'', position: value, typeCicle: typeCicleEnum.REGULAR, typeOperation:  crudStatus.CREATED })
            } else {
                this.cicles.splice(position , 1)
            }
        },
        submit(){
            let text = this.$route.params.new == 'edit' ? 'editar los datos de': 'agregar'
            this.$refs.confirmModal.open('icon-ic-carreras', `¿Estás seguro que deseas ${text} esta carrera?`)
        },
        cancel(){
            if(this.isNewCareer) this.$refs.confirmModal.open('icon-ic-carreras', '¿Estás seguro que deseas cancelar la creación de esta carrera?', this.prevPage)
            else this.$refs.confirmModal.open('icon-ic-carreras', '¿Estás seguro que deseas cancelar la edición de esta carrera?', this.prevPage)   
        },
        async sendData(){
            let newArray = []
            newArray.push(...this.cicles, ...this.coursesElectivos)
            if(this.checked == true ) {
                newArray.unshift(...this.coursesCicleZero)
            }
            try {
                await this.$store.dispatch('career/create', {
                    name: this.form.name.trim().replace(/\s+/g, ' '),
                    code: this.form.code.toUpperCase(),
                    countCicles: this.endCicle,
                    isCicleZero: this.checked,
                    idCollege: this.collegeSelect.university,
                    idFaculty: this.form.facultad.idFaculty,
                    studyPlan: newArray
                })
                this.$router.push(this.prevPage)
            } catch(error) {
                if(!(error instanceof GatewayTimeoutError)) {
                    this.errorMessage = error.message
                    if(this.errorMessage == "El codigo ya fue registrado" ) this.prevCode = this.form.code
                    else if(this.errorMessage == "El nombre ya fue registrado" ) this.prevName = this.form.name
                    
                } else this.$catchError(error)
            }
            this.$refs.confirmModal.close()
        },
        studyPlanCourses(val) {
            if(this.$route.params.new == 'edit') {
                if(val == 'delete') {
                    let storeCoursesDelete = this.$store.state.career.detailForEdit.studyPlan.map(i => i.courses.map(e => e.typeOperation))
                    let storeElectivosDelete = this.$store.state.career.detailForEdit.coursesElectivos.map(i => i.courses.map(e => e.typeOperation))
                    let storeZeroDelete = this.$store.state.career.detailForEdit.coursesCicleZero.map(i => i.courses.map(e => e.typeOperation))

                    let storeTypeOperation = [].concat(...storeCoursesDelete, ...storeElectivosDelete, ...storeZeroDelete)

                    let courseRegularTypeOperation = this.cicles.map(i => i.courses.map(e => e.typeOperation))
                    let cicleZeroTypeOperation = this.coursesCicleZero.map(i => i.courses.map(e => e.typeOperation))
                    let coursesElectivoTypeOperation = this.coursesElectivos.map(i => i.courses.map(e => e.typeOperation))

                    let typeOperationCourses = [].concat(...courseRegularTypeOperation, ...cicleZeroTypeOperation, ...coursesElectivoTypeOperation)

                    this.isDeleteCourse = !Boolean(typeOperationCourses.filter((item, i) => storeTypeOperation.indexOf(item) == -1).length)
                } else {
                    let storeCourses = this.$store.state.career.detailForEdit.studyPlan.map(i => i.courses.map(e => e.typeOperation))
                    let storeElectivos = this.$store.state.career.detailForEdit.coursesElectivos.map(i => i.courses.map(e => e.typeOperation))
                    let storeZero = this.$store.state.career.detailForEdit.coursesCicleZero.map(i => i.courses.map(e => e.typeOperation))

                    let storeData = [].concat(...storeCourses, ...storeElectivos, ...storeZero)

                    let courseRegular2 = this.cicles.map(i => i.courses.map(e => e.typeOperation))
                    let cicleZero2 = this.coursesCicleZero.map(i => i.courses.map(e => e.typeOperation))
                    let coursesElectivo2 = this.coursesElectivos.map(i => i.courses.map(e => e.typeOperation))

                    let typeOperations = [].concat(...courseRegular2, ...cicleZero2, ...coursesElectivo2)

                    this.changeCicles = !Boolean(typeOperations.filter((item, i) => storeData.indexOf(item) ==  -1 ).length)
                }
            }
        },
        async findCourse(val) {
            let idCollege = this.$route.params.university
            await this.$store.dispatch('course/findCourseForCareer', { idCollege, term: val })
        },
        editNewCareer() {
            switch(this.$route.params.new) {
                case('new'):
                    this.title = 'Nueva Carrera'
                    break
                case('edit'):
                    this.title = 'Editar Carrera'
                    this.form.name = this.prevName = this.detail.name
                    this.form.code = this.prevCode = this.detail.code
                    this.checked = this.prevChecked = JSON.parse(JSON.stringify(this.detail.isCicleZero))
                    this.form.facultad = this.prevFacultad = JSON.parse(JSON.stringify(this.detail.faculty.name))
                    this.endCicle = this.prevEndCicle = JSON.parse(JSON.stringify(this.detail.studyPlan.length))
                    this.prevStudyPlan = JSON.parse(JSON.stringify(this.detail.studyPlan))
                    break
            }
        },
        async editCareer() {
            let newArray = []
            newArray.push(...this.cicles, ...this.coursesElectivos)
            if(!this.isNewCareer && this.coursesCicleZero[0].idStudyPlan) newArray.unshift(...this.coursesCicleZero)
            else {
                if(this.checked) newArray.unshift(...this.coursesCicleZero)
            }
            newArray.unshift(...this.deletedCycles) 

            let faculty
            if(this.form.facultad == this.detail.faculty.name) {
                faculty = this.detail.faculty.idFaculty
            } else {
                faculty = this.form.facultad.idFaculty
            }
            
            try {
                await this.$store.dispatch('career/update', {
                    "idCollege": this.collegeSelect.university,
                    "idCareer": this.$route.query.idCareer,
                    "name": this.form.name.trim().replace(/\s+/g, ' '),
                    "code": this.form.code.toUpperCase(),
                    "idFaculty": faculty,
                    "countCicles": this.endCicle,
                    "isCicleZero": this.checked,
                    "studyPlan": newArray
                })
                this.$router.push(this.prevPage)
            } catch(error) {
                if(!(error instanceof GatewayTimeoutError)) {
                    this.errorMessage = error.message
                    if(this.errorMessage == "El código ya fue registrado" ) this.prevCode = this.form.code
                    else if(this.errorMessage == "El nombre ya fue registrado" ) this.prevName = this.form.name
                    
                } else this.$catchError(error)
            }
            this.$refs.confirmModal.close()
        },
        action() {
            if(this.$route.params.new == 'new') {
                this.sendData()
            } else {
                this.editCareer()
            }
        },
        deleteCourse(val) {
            this.studyPlanCourses('delete')
            if(val.type == this.typeCicleEnum.ELECTIVE) {
                this.$refs.aditionals[0].$forceUpdate()
            } else if(val.type == this.typeCicleEnum.ZERO) {
                this.$refs.cicleZero[0].$forceUpdate()
            } else {
                this.$refs.cardCicle[val.position].$forceUpdate()
            }
        },
        changeDropdown(val) {
            this.isActive = val == true ? val : false
        },
        codeKeyPress(evt) {
            this.lettersAndNumbers()
            this.dontAllowSpaces()
        }
    },
    watch: {
        checked(val){
            if(val == false){
                if(this.coursesCicleZero[0]) this.coursesCicleZero[0].typeOperation = crudStatus.DELETED 
                let cicleZero = this.cicles.filter(i => i.name == 'Ciclo 0')
                let position = this.cicles.findIndex(i => i.name == 'Ciclo 0')
                Boolean(cicleZero.length) ? this.cicles.splice(position, 1) : ''
                if(this.$refs.cardCicle.length !== 0) {
                    this.$refs.cardCicle[0].$forceUpdate()
                }
            } else {
                if(this.coursesCicleZero[0])
                    if(this.isNewCareer) this.coursesCicleZero[0].typeOperation = crudStatus.CREATED
                    else {
                        if(this.coursesCicleZero[0].idStudyPlan) this.coursesCicleZero[0].typeOperation = crudStatus.ORIGINAL
                        else this.coursesCicleZero[0].typeOperation = crudStatus.CREATED
                    }
            }
        },
        multipleListener() {
            if(
                this.form.name == this.prevName &&
                this.form.code == this.prevCode
            ) {
                this.btnEdit  = true
            } else {
                this.btnEdit = false
            }

        },
        course(val) {
            if(this.$route.params.new == 'edit') {
                let cicleZero = this.coursesCicleZero.map(item => item.courses.map(e => e.idCourse))
                let ciclesRegular = this.cicles.map(i => i.courses.map(e => e.idCourse))
                let coursesElectivos = this.coursesElectivos.map(i => i.courses.map(e => e.idCourse))
                let selectCoursesForEdit = [].concat(...ciclesRegular, ...coursesElectivos, ...cicleZero)
                this.courses = val.filter((item, i) => selectCoursesForEdit.indexOf(item.idCourse) == -1)
            } else {
                this.courses = val
            }
        }
    },
    mounted() {
        this.$nextTick(function () {
            this.collegeSelect = this.$route.params
            let newArray = []
            if(this.$route.params.new == 'edit') {
                this.cicles = JSON.parse(JSON.stringify(this.$store.state.career.detailForEdit.studyPlan))
                this.coursesElectivos = JSON.parse(JSON.stringify(this.$store.state.career.detailForEdit.coursesElectivos))
                this.coursesCicleZero = JSON.parse(JSON.stringify(this.$store.state.career.detailForEdit.coursesCicleZero))
                if(this.coursesCicleZero.length <= 0) {
                    this.coursesCicleZero.push({name: `Ciclo 0`, courses: [], idStudyPlan:'', typeCicle:  typeCicleEnum.ZERO, typeOperation:  crudStatus.CREATED })
                } else return
            } else {
                for(let i = 0; i < this.endCicle; i ++) {
                    newArray.push({name: `Ciclo ${i + 1}`, courses: [], idStudyPlan:'', position: i, typeCicle:  typeCicleEnum.REGULAR, typeOperation:  crudStatus.CREATED})
                    this.cicles = newArray
                }
                this.coursesElectivos.push({name: `Electivos`, courses: [], idStudyPlan:'', position: this.cicles.length + 1, typeCicle:  typeCicleEnum.ELECTIVE, typeOperation:  crudStatus.CREATED })
                this.coursesCicleZero.push({name: `Ciclo 0`, courses: [], idStudyPlan:'', typeCicle:  typeCicleEnum.ZERO, typeOperation:  crudStatus.CREATED })
            }
            document.body.removeEventListener('keyup', e => {
                if(e.keyCode == 27)
                    this.$refs.confirmModal.close()
            })
            document.querySelector(".cicle__input input").setAttribute("readonly", "true");
        })
    },
    created(){
        this.$nuxt.$on('elementsSelected', data => {
            if(data.type == 'courses') {
                let isEdit = this.cicles
                let isEditCicle = data.cicle
                isEdit[isEditCicle].courses = data.courses
                isEdit[isEditCicle].name = 'Ciclo ' + data.cicle
                isEdit[isEditCicle].position = data.cicle
                isEdit[isEditCicle].typeOperation = data.typeOperation
            } else return

            if(this.$route.params.new == 'edit') {
                this.isNewCareer = false
                this.cicles = JSON.parse(JSON.stringify(this.$store.state.career.detailForEdit))
            } else this.isNewCareer = true
        })
        this.editNewCareer()
    }
}
</script>

<style lang="sass">
    .el-form-item__error
        min-width: 300px
    .text_capitalize
        .el-input__inner
            text-transform: capitalize
    .text_uppercase
        .el-input__inner
            text-transform: uppercase
</style>
