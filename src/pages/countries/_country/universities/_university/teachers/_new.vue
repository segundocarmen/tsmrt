<template lang="pug">
    div.edit-teacher 
        h1.title__state-back 
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            span {{ title }}
        el-form(v-if="isNewTeacher || editType == 1" label-width="70px").mt-80.mb-80.form-general-information
            el-form-item(label="Nombre" :error="nameRules")
                el-input(
                    v-model="newTeacher.name" 
                    @input="$v.newTeacher.name.$touch()" 
                    maxLength="50"
                )
            el-form-item(label="Apellido" :error="lastNameRules")
                el-input(v-model="newTeacher.lastName" @input="$v.newTeacher.lastName.$touch()" 
                    maxLength="50"
                )
            el-form-item(label="Correo" :error="emailRules")
                el-input(v-model="newTeacher.email" @input="$v.newTeacher.email.$touch()" maxLength="60")
            el-form-item(label="Código" :error="codeRules").input-code
                el-input(v-model.trim="newTeacher.code" @input="$v.newTeacher.code.$touch()" 
                    @keypress.native="codeKeyPress"
                    maxLength="30" 
                )
            el-form-item(label="Género" :error="genreRules").input-genre
                el-select(v-model="newTeacher.genre" @input="$v.newTeacher.genre.$touch()")
                    el-option(label="Masculino" :value="genre.MALE")
                    el-option(label="Femenino" :value="genre.FEMALE")
            no-ssr
                dropzone(
                    ref="dropzoneTeacher" 
                    id="teacherDropzone"
                    :options="dropzoneOptions" 
                    :destroyDropzone="true" 
                    v-on:vdropzone-thumbnail="thumbnail"
                    :include-styling="false"
                    @vdropzone-success="successDropzone"
                    @vdropzone-sending="sendingDropzone"
                    @vdropzone-processing="processingDropzone"
                    @vdropzone-error="errorDropzone"
                    @vdropzone-canceled="canceledDropzone"
                )
            div.image-error {{ imageError }}
        
        div(v-else)
            el-row.general-information.mt-48.mb-44
                el-col(:span="8").mt-40
                    .flex-layout.mb-40
                        label Nombre
                        p {{ data.firstName }}
                    .flex-layout
                        label Código
                        p {{ data.code }}
                el-col(:span="8").mt-40
                    .flex-layout.mb-40
                        label Apellido
                        p {{ data.lastName }}
                    .flex-layout
                        label Correo 
                        p {{ data.email }}
                el-col(:span="8").text-right 
                    img(:src="data.url").userImage

            .mb-80
                h2(v-if="editType == 2").subtitle__blue-general.fz-18 Cursos que dicta
                h2(v-else).subtitle__blue-general.fz-18 Cursos que dictó
                ul.courses__list-container
                    li.blue__item-list( v-for="(course, i) in  courseList ", :key="i" v-if="course.value.typeOperation !== crudStatus.DELETED") 
                        p.blue__item-lastname {{ course.label }}
                        i.icon-ic-cross-normal(@click="deleteCourse(course, i)")
                    li.multiple__select-input
                        el-select(
                            v-model='coursesSelected', 
                            multiple='', 
                            filterable='', 
                            :remote='true', 
                            placeholder='Agregar cursos', 
                            :remote-method='remoteMethod', 
                            :loading='loading'
                            @change="addCourse"
                            reserve-keyword
                            value-key="label"
                            name="labelAlternative"
                            ref="course"
                        )
                            el-option(v-for='(item, index) in listCareerOptions', :key="item.id", :label='item.labelAlternative', :value='item')
        
        footerEdit(@cancel="cancel" @save="submit" :disabled="btnDisabled" :errorMessage="errorMessage")
        confirmModal(ref="confirmModal" @save="saveTeacher")
</template>

<script>
import footerEdit from '~/components/shared/footer-edit'
import { required, email, minLength } from 'vuelidate/lib/validators'
import { withParams } from 'vuelidate/lib/validators/common'
import { eventBus } from '~/event-bus'
import confirmModal from '~/components/modals/general'
import { crudStatus, genre, isDictates } from '~/enums'
import { mapState } from 'vuex'
import { lettersAndNumbersMixin, onlyLettersMixin, dontAllowSpacesMixin } from '~/mixins'

export default {
    mixins: [lettersAndNumbersMixin, onlyLettersMixin, dontAllowSpacesMixin],
    layout: 'university',
    async fetch({ store, params, query }) {
        let idTeacher = query.idTeacher
        if(idTeacher) {
            try {
                await store.dispatch('teacher/getDetail', idTeacher)
                if(query.type != 1) {
                    let isDictates = query.type == 2 ? true : false
                    await store.dispatch('teacher/getCoursesByTeacher', { idTeacher, isDictates })
                }
            } catch(error) {
                console.log(error)
                store.dispatch('catchError', error)
            }
        }
    },
    head() {
        return { 
            title: this.title
        }
    },
    components: {
        footerEdit,
        confirmModal
    },
    data() {
        let data = {}
        let courseList = []
        let listCourseOptions = []

        if(this.$route.query.idTeacher) {
            data = JSON.parse(JSON.stringify(this.$store.state.teacher.detail))
            if(this.$route.query.type != 1) courseList = JSON.parse(JSON.stringify(this.$store.state.teacher.listCareerByTeacher))
        }

        return {
            title: '',
            isNewTeacher: true,
            editType: 1,
            data,
            newTeacher: {
                name: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                code: data.code || '',
                genre: data.typeSex
            },
            prevPage: '',
            imageUrl: data.url || '',
            courseList,
            listCourseOptions,
            coursesSelected: [],
            loading: false,
            errorMessage: '',
            idCollege: '',
            idTeacher: '',
            idCountry: '',
            genre,
            s3Key: '',
            isImageUploading: false,
            prevCode: '',
            imageError: '',
            timeout: null,
            prevCourseList: []
        }
    },
    methods: {
        submit() {
            this.$v.newTeacher.$touch()
            if(this.$v.newTeacher.error) return
            if(this.isNewTeacher) this.$refs.confirmModal.open('icon-ic-teacher', '¿Estás seguro que deseas crear este profesor?')
            else this.$refs.confirmModal.open('icon-ic-teacher', '¿Estás seguro que deseas editar este profesor?')
        },
        cancel() {
            if(this.isNewTeacher) this.$refs.confirmModal.open('icon-ic-teacher', '¿Estás seguro que deseas cancelar la creación del nuevo profesor?', this.prevPage)
            else this.$refs.confirmModal.open('icon-ic-teacher', '¿Estás seguro que deseas cancelar la edición de este profesor?', this.prevPage)   
        },
        //cuando la imagen ha sido arrastrada al dropzone, esta se guarda en un archivo temporal de s3
        async successDropzone(file, response) {
            this.imageUrl = response.Location
            this.s3Key = response.Key
            this.isImageUploading = false
            this.imageError = ''
            if(document.querySelector('.dz-preview-image')) document.querySelector('.dz-preview-image').setAttribute('style', '')
        },
        //cuando enviamos los datos para definir la ruta en la que se va guardar la imagen
        sendingDropzone(file, xhr, formData) {
            formData.append( 'idCountry', this.idCountry )
            formData.append( 'idCollege', this.idCollege )
            formData.append( 'idTeacher', this.idTeacher )
        },
        
        processingDropzone(file) {
            this.isImageUploading = true
            let files = this.$refs.dropzoneTeacher.dropzone.files
            //cuando se arrastra al dropzone mas de un archivo
            if(files.length > 1) {
                this.$refs.dropzoneTeacher.dropzone.files.pop()
                document.querySelectorAll(".dz-preview")[0].remove()
            }
        },
        errorDropzone(file, message, xhr) {
            console.log('error', file, message, xhr)
            this.imageError = message
            if(document.querySelector('.dz-preview-image') && document.querySelector('.dz-preview-image').getAttribute('style')) {
                // document.querySelectorAll(".dz-error")[0].remove()
                document.getElementById("teacherDropzone").classList.remove('dz-started')
            }
        },
        canceledDropzone() {
            console.log('cancel')
        },
        async saveTeacher() {
            let response
            let teacherInformation = {
                "idCollege": this.idCollege,
                "firstName": this.newTeacher.name.trim(),
                "lastName": this.newTeacher.lastName.trim(),
                "code": this.newTeacher.code.toUpperCase(),
                "email": this.newTeacher.email || '',
                "typeSex": Number(this.newTeacher.genre)
            }
            try {
                if(this.isNewTeacher) {
                    response = await this.$store.dispatch('teacher/create', {
                        ...teacherInformation,
                        "url": ''
                    })
                    this.idTeacher = response.idTeacher  
                    if(this.s3Key !== '') await this.updateImageUrl() 
                    this.$refs.confirmModal.close()    
                    this.$router.push(this.prevPage)        
                } else {
                    console.log('edit')
                    if(this.editType == 1) {
                        await this.$store.dispatch('teacher/edit', { 
                            data: {
                                "idTeacher": this.idTeacher,
                                "url": this.imageUrl || '',
                                ...teacherInformation
                            }, 
                            type: this.editType
                        })
                        if(this.s3Key !== '') await this.updateImageUrl()
                  
                    } else {
                        let courseList = this.courseList.map(item => {
                            if(this.editType == 2 && item.value.isDictates == isDictates.FALSE) item.value.typeOperation = crudStatus.UPDATED

                            return item.value
                        })
                        await this.$store.dispatch('teacher/edit', {
                            data: {
                                "idTeacher": this.idTeacher,
                                "courses": courseList,
                                "dictates": this.editType == 2 ? true : false
                            },
                            type: this.editType
                        })
                    }
                    this.$router.push(this.prevPage)
                    this.$refs.confirmModal.close()
                }
            } catch(error) {
                console.log('error?')
                if(error.code !== 409) this.$catchError(error)
                else {
                    this.errorMessage = error.message
                    this.prevCode = this.newTeacher.code
                }
                this.$refs.confirmModal.close()
            }
        },
        async updateImageUrl() {
            let route =  `country/${this.idCountry}/college/${this.idCollege}/teacher/${this.idTeacher}/profile`
            await this.$store.dispatch('teacher/changeFileDirectory', {
                key: this.s3Key,
                url: route
            }) 
            let url = this.imageUrl.replace(`temp/country/${this.idCountry}/college/${this.idCollege}/teacher`, route)
            
            if(this.imageUrl) 
                await this.$store.dispatch('teacher/updateImageUrl', {
                    idTeacher: this.idTeacher, 
                    url: url
                })
        },
        template() {
            return `<div class="dz-preview dz-file-preview">
                        <div class="dz-image">
                            <div data-dz-thumbnail-bg></div>
                        </div>
                        <div class="dz-details">
                        </div>
                        <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                        <div class="dz-error-message"><span data-dz-errormessage></span></div>
                        <div class="dz-success-mark"><i class="fa fa-check"></i></div>
                        <div class="dz-error-mark"><i class="fa fa-close"></i></div>
                    </div>
            `;
        },
        thumbnail(file, dataUrl) {
            var j, len, ref, thumbnailElement;
            if (file.previewElement) {
                file.previewElement.classList.remove("dz-file-preview");
                ref = file.previewElement.querySelectorAll("[data-dz-thumbnail-bg]");
                for (j = 0, len = ref.length; j < len; j++) {
                    thumbnailElement = ref[j];
                    thumbnailElement.alt = file.name;
                    thumbnailElement.style.backgroundImage = 'url("' + dataUrl + '")';
                }
                return setTimeout(((function(_this) {
                    return function() {
                        return file.previewElement.classList.add("dz-image-preview");
                    };
                })(this)), 1);
            }
        },
        addCourse(val) { 
            let course = JSON.parse(JSON.stringify(val[val.length - 1]))
            if(this.courseList.filter(item => item.id == course.id).length)
                // course.value.typeOperation = crudStatus.UPDATED
                course.value.typeOperation = crudStatus.ORIGINAL

            let newCourseList = this.courseList.filter(item => item.id !== course.id)

            newCourseList.push(course)

            this.courseList = newCourseList
            this.$store.commit('teacher/setComboCareerByTeacher', [])
            this.$refs.course.query = ''

            this.coursesSelected = []
        },
        remoteMethod(query) {
            if (query !== '') {
                this.loading = true
                clearTimeout(this.timeout)
                this.timeout = setTimeout(async() => {
                    await this.$store.dispatch('teacher/findCoursesByTeacher', {
                        idCollege: this.idCollege,
                        idTeacher: this.idTeacher,
                        term: query,
                        isDictates: this.editType == 2 ? true : false
                    })
                    this.loading = false
                }, 200) 
                
            } else {
                this.$store.commit('teacher/setComboCareerByTeacher', [])
            }
        },
        deleteCourse(item, index) {
            if(item.value.typeOperation == crudStatus.CREATED) {
                this.courseList.splice(this.courseList.indexOf(item), 1)
                this.coursesSelected.splice(this.coursesSelected.indexOf(item), 1)
            } else {
                this.courseList[index].value.typeOperation = crudStatus.DELETED
            }
            this.coursesSelected = []
        },
        updateGeneralInformation() {

        },
        updateCourses() {

        },
        codeKeyPress() {
            this.lettersAndNumbers()
            this.dontAllowSpaces()
        }

    },
    validations: {
        newTeacher: {
            name: { 
                required,
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^A-Za-zÀ-ÖØ-öø-ÿÑñâêîôû\s]/.test(value)
                ),
            },
            lastName: { 
                required,
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^A-Za-zÀ-ÖØ-öø-ÿÑñâêîôû\s]/.test(value)
                ),
            },
            email: { 
                email, 
                letters: withParams(
                    { type: 'email' },
                    value => !/[^0-9-a-z-ÑñáéíóúäëïöüâêîôûàèìòùÀÈÌÒÙÂÊÎÔÛÁÉÍÓÚÄËÏÖÜ@._\s]/.test(value)
                )
            },
            code: { 
                required, 
                minLength: minLength(3),
                letters: withParams(
                    { type: 'letters' },
                    value => !/[^0-9-a-zA-ZÑñ\s]/.test(value)
                )
            },
            genre: { required }
        }
    },
    computed: {
        ...mapState({
            listComboCareerByTeacher: state => state.teacher.listComboCareerByTeacher
        }),
        listCareerOptions(){
            let courseListIds =  this.courseListFilter.map(item => {
                if(item.typeOperation !== crudStatus.DELETED) return item.idCourse
            })
            return this.listComboCareerByTeacher.filter(item => {
                return courseListIds.indexOf(item.id) == -1
            })
        },
        nameRules() {
            return [
                !this.$v.newTeacher.name.$dirty || this.$v.newTeacher.name.required || '*Debes de ingresar un nombre',
                !this.$v.newTeacher.name.$dirty || this.$v.newTeacher.name.letters || '*Evita ingresar caracteres especiales'
            ].filter( val => typeof(val) == 'string')[0]
        },
        lastNameRules() {
            return [
                !this.$v.newTeacher.lastName.$dirty || this.$v.newTeacher.lastName.required || '*Debes de ingresar un apellido',
                !this.$v.newTeacher.lastName.$dirty || this.$v.newTeacher.lastName.letters || '*Evita ingresar caracteres especiales'
            ].filter( val => typeof(val) == 'string')[0]
        },
        emailRules() {
            return [
                // !this.$v.newTeacher.email.$dirty || this.$v.newTeacher.email.required || '*Debes de ingresar un email',
                !this.$v.newTeacher.email.$dirty || this.$v.newTeacher.email.email || '*Debes de ingresar un correo válido',
                !this.$v.newTeacher.email.$dirty || this.$v.newTeacher.email.letters || '*Debes de ingresar caracteres validos'
            ].filter( val => typeof(val) == 'string')[0]
        },
        codeRules() {
            return [
                !this.$v.newTeacher.code.$dirty || this.$v.newTeacher.code.required || '*Debes de ingresar un código',
                !this.$v.newTeacher.code.$dirty || this.$v.newTeacher.code.minLength || '*Debes de ingresar 3 caracteres como mínimo',
                !this.$v.newTeacher.code.$dirty || this.$v.newTeacher.code.letters || "*Evita ingresar caracteres especiales"
            ].filter( val => typeof(val) == 'string')[0]
        }, 
        genreRules() {
            return [
                !this.$v.newTeacher.genre.$dirty || this.$v.newTeacher.genre.required || '*Debes de seleccionar una opción'
            ].filter( val => typeof(val) == 'string')[0]
        },
        btnDisabled() {
            if(this.isNewTeacher) return this.prevCode == this.newTeacher.code || this.$v.newTeacher.$invalid || this.$v.newTeacher.$error || this.isImageUploading
            else if(this.editType == 1) return this.btnEdit || this.$v.newTeacher.$anyError || this.$v.newTeacher.$invalid || this.isImageUploading
            else return !this.btnEdit
        },
        btnEdit() {
            if(this.isNewTeacher || this.editType == 1) {
                return (
                    this.prevName == this.newTeacher.name &&
                    this.prevLastName == this.newTeacher.lastName &&
                    this.prevEmail == this.newTeacher.email &&
                    this.prevCode == this.newTeacher.code &&
                    this.prevGenre == this.newTeacher.genre &&
                    this.prevImageUrl == this.imageUrl
                )
            } else {
                if(this.prevCourseList.length !== this.courseList.length) return true
                else {
                    return (
                        this.prevCourseList.filter((item, i) => this.courseList[i].id !== item.id ).length ||
                        this.courseList.filter(item => item.value.typeOperation == crudStatus.DELETED).length
                    )
                }
            }
            
        },
        crudStatus() {
            return crudStatus
        },
        courseListFilter() {
            return this.courseList.map(item => item.value)
        },
        dropzoneOptions() {
            return {
                url: `${this.$router.options.base}api/s3/upload`, 
                // url: 'https://httpbin.org/post',
                thumbnailWidth: 150,
                thumbnailWidth: 122,
                thumbnailHeight: 122,
                dictDefaultMessage: this.dropzoneDefaultMessage,
                // dictDefaultMessage: '<div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de </br><strong class="bold">600 x 600 px.</strong></p></div>',
                previewTemplate: this.template(),
                acceptedFiles: '.png, .jpg, .jpeg'
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            console.log(this.$router)
            let params = this.$route.params
            let query = this.$route.query
            this.prevPage = this.isNewTeacher ? `/countries/${params.country}/universities/${this.idCollege}/teachers` : `/countries/${params.country}/universities/${this.idCollege}/teachers/detail?id=${query.idTeacher}&page=${query.page}`
        })
    },
    created() {
        let params = this.$route.params.new
        this.idCollege = this.$route.params.university
        this.idTeacher = this.$route.query.idTeacher
        this.idCountry = this.$route.params.country
        if(params == "new") { 
            this.title = "Nuevo Profesor"
            this.dropzoneDefaultMessage = `<div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de </br><strong class="bold">600 x 600 px.</strong></p></div>`
        } else {
            this.title = "Editar"
            this.editType = this.$route.query.type
            this.isNewTeacher = false
            if(this.editType == 1) {
                this.dropzoneDefaultMessage = `<div class="dz-img-specifications-container"><div class="dz-preview-image" style="background-image: url(${this.imageUrl})"></div><div class="dz-specifications"><i class="icon-ic-add-normal"></i><p class="fz-12 regular smoothing-antialiased">Agregar foto de </br><strong class="bold">600 x 600 px.</strong></p></div></div>`
                
                this.prevName = this.data.firstName,
                this.prevLastName = this.data.lastName,
                this.prevEmail = this.data.email,
                this.prevCode = this.data.code,
                this.prevGenre = this.data.typeSex
                this.prevImageUrl = this.data.url
            } else {
                this.prevCourseList = JSON.parse(JSON.stringify(this.courseList))
            }
        }
    }
}
</script>

<style lang="sass">
    .edit-teacher 
        .el-form-item
            display: flex
        .el-form-item__content
            width: 312px
            margin-left: 0 !important
        .el-form-item__label
            -webkit-font-smoothing: antialiased
        .input-code,
        .input-genre
            .el-form-item__content
                .el-input 
                    width: 232px
        .input-code 
            .el-input__inner
                text-transform: uppercase
        .form-general-information
            position: relative
        .userImage 
            width: 122px
            height: 122px
            border-radius: 12px
            box-shadow: 0 3px 9px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.04)
        #teacherDropzone
            @extend .userImage
            min-height: 122px
            border: 0.5px dashed rgba(123,143,160,0.3)            
            background-color: #F9FBFE
            padding: 0 !important
            position: absolute
            right: 0
            top: -30px
            overflow: hidden
            @include transition(0.25s)
            .dz-img-specifications-container
                height: 100%
                .dz-specifications
                    opacity: 0
                &:hover 
                    .dz-specifications
                        opacity: 0.7
            .dz-preview-image
                background-size: cover
                background-position: center
                height: 100%
                position: absolute
                top: 0
                left: 0
                right: 0
            .dz-specifications
                background-color: rgba(249, 251, 254, 1)
                opacity: 0.7
                padding-top: 25px
                margin: 0
                height: 100%
                @include transition(0.25s)
                i, p
                    //color: #9da6af
                    color: #909399
                    // font-weight: 600
                i 
                    font-size: 38px
                    line-height: 1
                p 
                    font-family: $default-font
                    text-align: center
                    padding: 0 5px 5px
                strong
                    color: #909399
                    font-weight: bold
            .dz-default.dz-message
                margin: 0
                display: block
                position: absolute
                z-index: 999
                width: 100%
                height: 100%
                transition: opacity .2s linear
            &.dz-started
                border: 0
                .dz-default.dz-message
                    opacity: 0
                &:hover 
                    .dz-default.dz-message
                        opacity: 1
            .dz-preview 
                .dz-image
                    width: 122px
                    height: 122px
                    margin-bottom: 10px
                    > div
                        width: inherit
                        height: inherit
                        background-size: contain
                    > img 
                        width: 100%
                // .dz-details
                //     color: white
                //     transition: opacity .2s linear
                //     text-align: center
                //     padding: 0
                //     background-color: #ffffff
                // &:hover 
                //     .dz-details
                //         background-color: rgba(249, 251, 254, 1)
                //         opacity: 0.7;
            .dz-success-mark, .dz-error-mark, .dz-remove
                display: none  
            .dz-image-preview
                margin: 0
        input.el-input__inner
            line-height: 18px
            font-family: "Open Sans"
        .general-information 
            max-width: 1000px
            label, p
                font-family: $default-font
                font-size: 14px
            label 
                color: #909399
            p 
                color: #415061
                font-weight: bold
                margin-left: 24px
        .el-form-item__label, .el-input__inner
            color: #909399 !important

        .image-error
            top: 105px
            position: absolute
            right: 0
            color: #f56c6c
            font-size: 12px
            width: 120px
            @include transition(.2s)
</style>    


