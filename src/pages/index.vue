<template lang="pug">
    el-container
        div.login  
            img(src="~assets/images/logo/img_logowabu_white.png").login__logo
            .error-user(v-if="isUserInvalid") Usuario o contraseña incorrectos
            el-form.login__form
                el-form-item(label="Correo" :error="emailErrorMessages[0]")
                    el-input(v-model="email" @input="$v.email.$touch()" maxLength="50")
                el-form-item(label="Contraseña" :error="passwordErrorMessages[0]")
                    el-input(v-model="password" 
                        :class="{ 'showPasswordStyle' : showPassword }" 
                        @input="$v.password.$touch()" 
                        :type="showPassword ? 'text' : 'password'"
                    ).login__input--password
                    i.show-password(:class="getIconClass()" @click="togglePassword")
                el-button.wabu-btn.wabu-btn--white(:class="{ 'disabled' : isDisabled }" @click="submit('dynamicValidateForm')" plain) ENTRAR
                a(href="#").forgot-password__link Olvidé mi contraseña

            .wabu__developer Powered by
                img(src="~/assets/images/logo/logo-tismart.png")
</template>

<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { GatewayTimeoutError } from '~/errors'
import { roles } from '~/enums'
export default {
    layout: 'default',
    head: {
        title: 'Login'
    },
    data() {
        return {
            isUserInvalid: false,
            email: '',
            password: '',
            showPassword: false,
            isDisabled: false
        }
    },
    fetch({ store, redirect }) {
        if(store.state.account.authentication.token) {
            if(store.state.account.user.user.rol == roles.ADMIN_GLOBAL)
                redirect('/countries')
            else {
                let idCountry = store.state.account.user.user.countries[0]
                if(store.state.account.user.user.rol == roles.ADMIN_COUNTRY)
                    redirect(`/countries/${idCountry}/universities`)
                else {
                    let idCollege = store.state.account.user.user.colleges[0]
                    redirect(`/countries/${idCountry}/universities/${idCollege}`)
                }
            }
        }
    },
    validations: {
        email: { 
            required, 
            email,
            maxLength: maxLength(50)
        },
        password: { 
            required, 
            minLength: minLength(8)
        }
    },
    computed: {
        emailErrorMessages() {
            return [
                    !this.$v.email.$dirty || this.$v.email.required || '*Debes de ingresar un correo',
                    !this.$v.email.$dirty || this.$v.email.email || '*Debes de ingresar un email válido'
                ].filter( val => typeof(val) == 'string')
        },
        passwordErrorMessages() {
            return [
                    !this.$v.password.$dirty || this.$v.password.required || '*Debes de ingresar una contraseña',
                    !this.$v.password.$dirty || this.$v.password.minLength || '*Debes de ingresar 8 caracteres como mínimo'
                ].filter( val => typeof(val) == 'string')
        }
    },
    methods: {
        async submit(formName) {
            this.$v.$touch()
            if(!this.$v.$invalid) {
                this.isDisabled = true
                try {
                    await this.$store.dispatch('cancelRequest')
                    await this.$store.dispatch('account/authentication/login', {
                        email: this.email,
                        password: this.password
                    })
                    await this.$store.dispatch('country/getListAdmin')
                    await this.redirectPage()
                    this.isUserInvalid = false
                } catch(error) {
                    if(!(error instanceof GatewayTimeoutError)) this.isUserInvalid = true
                    this.$catchError(error)
                }
                this.isDisabled = false
            }

        },
        togglePassword() {
            this.showPassword = !this.showPassword 
        },
        getIconClass() {
            return !this.showPassword ? 'icon-normal' : 'icon-notpreview'
        },
        redirectPage() {
            let state = this.$store.state.account
            let rol = state.user.user.rol

            if(rol == roles.ADMIN_GLOBAL) this.$router.push('/countries')
            else {
                let idCountry = state.user.user.countries[0]
                if(rol == roles.ADMIN_COUNTRY) this.$router.push(`/countries/${idCountry}/universities`)
                else {
                    let idCollege = state.user.user.colleges[0]
                    this.$router.push(`/countries/${idCountry}/universities/${idCollege}`)
                }
            }
        }
    }
}
</script>

<style lang="sass">
    .login
        .el-form-item__error
            color: #FDFFFC
            font-size: 12px
            font-weight: 100
            letter-spacing: 0.24px
            font-family: $login-font
            -webkit-font-smoothing: antialiased
            text-align: right
            right: 0
        .error-user 
            color: #ffffff
            font-size: 16px
            letter-spacing: 0.32px
            font-family: $login-font
            line-height: 0
            position: relative
            top: 50px
            font-weight: 100
            -webkit-font-smoothing: antialiased

        .el-form-item
            &.is-error,
            &.is-success
                .el-input__inner
                    border-color: #ffffff
            &.is-required
                .el-form-item__label
                    &:before
                        content: ''

        .el-input__inner
            letter-spacing: 0.3px
        .show-password 
            position: absolute
            right: 15px
            color: white
            font-size: 20px
            line-height: 0.5
            top: 29px
            cursor: pointer
        .login__input--password
            .el-input__inner
                letter-spacing: 4px
                font-size: 15px
            &.showPasswordStyle
                .el-input__inner
                    letter-spacing: normal
                    font-size: 15px
        .wabu-btn 
            &.disabled 
                opacity: 0.7
                cursor: no-drop
        input
            line-height: 18px
            font-family: "Open Sans"
</style>



