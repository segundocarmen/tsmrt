<template lang="pug">
    .edit--questions 
        h2.title__state-back 
            nuxt-link(:to="prevPage").icon-prev.icon-ic-back-normal
            span {{ title }}
        el-form.mt-50.pb-80.mb-40
            el-row
                el-col(:span="18")
                    el-form-item(label="Pregunta" :error="questionErrorMessages").mr-48
                        el-input(
                            v-model="form.name"
                            width="100px"
                            @input="$v.form.name.$touch()"
                            maxLength="180"
                        )
                el-col(:span="4" :offset="1")
                    el-form-item(label="Dificultad")
                        el-select(v-model="form.level" placeholder="Seleccionar")
                            el-option(v-for="(item, i) in levelOptions" :key="i" :label="item" :value="item")

            h3.subtitle__blue-general.pt-15 Opciones
            el-row(v-for="(item, i) in answersCount" :key="i").question__item
                el-col(:span="18")
                    el-form-item(label="Respuesta" :error="answerErrorMessages[i]").mr-48
                        template(slot="label") Repuesta 0{{ i + 1 }}
                        el-input(
                            v-if="isNew"
                            v-model="form.answers[i].name"
                            :value="form.answers[i].name"
                            width="100px"
                            @input="$v.form.answers.$touch()"
                            maxLength="80"
                        )     
                        el-input(
                            v-else
                            v-model="form.answers[i].asnwerDescription"
                            :value="form.answers[i].asnwerDescription"
                            width="100px"
                            @input="$v.form.answers.$touch()"
                            maxLength="80"
                        )     
                el-col(:span="2").pt-15
                    span(v-if="!i").correct-answer-indicator
                        el-icon.icon-ic-check 
                        | Correcta
                    

        footerEdit(@cancel="cancel" @save="submit()",  :disabled="btnDisabled",  :errorMessage="errorMessage")
        confirmModal(ref="confirmModal" @save="saveData")

</template>

<script>
    import footerEdit from '~/components/shared/footer-edit'
    import confirmModal from '~/components/modals/general'
    import { internType, crudStatus } from '~/enums'
    import { required, email, minLength } from 'vuelidate/lib/validators'
    import { lettersAndNumbersMixin } from '~/mixins'

    export default {
        mixins: [lettersAndNumbersMixin],
        layout: 'university',
        head() {
            return {
                title: this.title,
            }
        },
        components:{
            footerEdit,
            confirmModal,
        },
        async fetch({ store, params, query }) {
            if(query.type == 2) {
                try {
                    await store.dispatch('questions/getDetail', query.id)
                } catch(error) {
                    console.log(error)
                    store.dispatch('catchError', error)
                }
            } else {
                store.commit('questions/setDetail', {})
            }
        },
        data() {
            let detail = {}
            let answersDefault = new Array({ name: '' }, { name: '' }, { name: '' }, { name: '' })
            if(this.$route.query.id){
                detail = this.$store.state.questions.detail ? JSON.parse(JSON.stringify(this.$store.state.questions.detail)) : {}
            }
            return {
                detail,
                title: '',
                prevPage: 'lalla',
                errorMessage: '',
                answersCount: 4,
                form: {
                    name: detail.question,
                    level: detail.difficulty,
                    answers: detail.options ? detail.options : answersDefault,
                },
                isNew: false,
                prevQuestion: '',
                prevLevel: '',
                prevAnswers: '',
                levelOptions: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
                inputsChange: false,
            }
        },
        validations() {
            if(this.isNew) {
                return {
                        form: {
                        name: { required },
                        level: { required },
                        answers: {
                            required,
                            minLength: minLength(4),
                            $each: {
                                name: {
                                    required
                                }
                            }
                        }
                    }
                }
            } else {
                return {
                        form: {
                        name: { required },
                        level: { required },
                        answers: {
                            required,
                            minLength: minLength(4),
                            $each: {
                                asnwerDescription: { 
                                    required
                                }
                            }
                        }
                    }
                }
            }
        }, 
        methods: {
            cancel() {
                this.$refs.confirmModal.open('icon-ic-preguntas', '¿Estás seguro que deseas cancelar la edición de la pregunta?', this.prevPage)
            },
            submit() {
                this.$refs.confirmModal.open('icon-ic-preguntas', '¿Estás seguro que deseas editar la pregunta?')
            },
            async saveData() {
                try {
                    await this.$store.dispatch('questions/update', {
                        "idQuestion": this.detail.idQuestion,
                        "question": this.form.name,
                        "difficulty": this.form.level,
                        "options": this.form.answers
                    })
                    this.$router.push(this.prevPage)
                } catch(error) {
                    console.log(error)
                }
                this.$refs.confirmModal.close()
            }
        },
        computed: {
            btnDisabled() {
                return this.$v.form.$invalid || !this.inputsChange
            },
            questionErrorMessages() {
                return [
                    !this.$v.form.name.$dirty || this.$v.form.name.required || 'Debes de ingresar una pregunta'
                ].filter( val => typeof(val) == 'string')[0]
            },
            answerErrorMessages() {
                let messages = [
                    // !this.$v.form.answers.$each.$iter[0].$dirty || !this.$v.form.answers.$each.$iter[0].$invalid || 'Debes de ingresar una respuesta',
                    // !this.$v.form.answers.$each.$iter[1].$dirty || !this.$v.form.answers.$each.$iter[1].$invalid || 'Debes de ingresar una respuesta',
                    // !this.$v.form.answers.$each.$iter[2].$dirty || !this.$v.form.answers.$each.$iter[2].$invalid || 'Debes de ingresar una respuesta',
                    // !this.$v.form.answers.$each.$iter[3].$dirty || !this.$v.form.answers.$each.$iter[3].$invalid || 'Debes de ingresar una respuesta',
                ]

                return messages.map(item => typeof(item) == 'string' ? item : '')
            }
        },
        watch: {
            form: {
                deep: true,
                handler(val) {
                    if(!this.isNew) {
                        this.prevAnswers.forEach((item, i) => {
                            if(this.form.answers[i].asnwerDescription !== item.asnwerDescription) this.form.answers[i].typeOperation = crudStatus.UPDATED
                            else  this.form.answers[i].typeOperation = crudStatus.ORIGINAL
                        })
                        this.inputsChange = !(this.prevAnswers.map(item => item.asnwerDescription).join('') == this.form.answers.map(item => item.asnwerDescription).join('') && 
                            this.prevQuestion == this.form.name && this.prevLevel == this.form.level)
                    } else {
                        this.inputsChange = true
                    }
                }
            }
        },
        created() {
            let country = this.$route.params.country
            let university = this.$route.params.university
            let page = this.$route.query.page ? `${this.$route.query.page}` : ''
            let term = this.$route.query.term ? `${this.$route.query.term}` : ''
            let id = this.$route.query.id ? `${this.$route.query.id}` : ''
            // let detail = this.$store.state.questions.detail
            if(this.$route.query.type == internType.EDIT) {
                this.title = 'Editar pregunta'
                this.prevPage = `/countries/${country}/universities/${university}/questions/detail?id=${id}&page=${page}&term=${term}`
                let detail = this.$store.state.questions.detail ? JSON.parse(JSON.stringify(this.$store.state.questions.detail)) : {}
                this.prevAnswers = detail.options
                this.prevLevel = detail.difficulty
                this.prevQuestion = detail.question
            } else {
                this.title = 'Nueva pregunta'
                this.prevPage = `/countries/${country}/universities/${university}/questions?page=${page}&term=${term}`
                this.isNew = true
            }
        }
    }
</script>

<style lang="sass">
    .edit--questions  
        .el-form 
            max-width: 750px
            .el-form-item__label
                color: #909399
                font-size: 12px
                font-weight: 300
                letter-spacing: 0.5px
                margin-bottom: -5px

            .question__item 
                display: flex
                align-items: center
                .el-radio
                    margin-left: -15px
                .el-radio__inner
                    width: 16px
                    height: 16px
                .el-radio__label
                    font-weight: 300
                    -webkit-font-smoothing: antialiased
                    font-size: 15px

        .correct-answer-indicator
            font-size: 14.5px
            -webkit-font-smoothing: antialiased
            display: inline-flex
            margin-left: -35px
            i 
                color: $main-color
                margin-right: 7px
                font-size: 16px
                position: relative
                top: 1px
</style>
