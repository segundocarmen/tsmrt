import jsCookies from 'js-cookie'
import Cookies from 'cookies'
import { Buffer } from 'browser-buffer'
import { Store } from 'vuex'

export default ({ req, res }, inject) => {
    const COOKIE = new Buffer(`affiliation`).toString('base64').replace(/=/g, '')

    Store.prototype.$setAuthCookie = value => {
        if (!value)
            throw new Error('no se pudo generar la cookie de autenticación')

        const json = `${JSON.stringify(value)}|${Date.now()}`
        const encodedText = new Buffer(json).toString('base64')
        jsCookies.set(COOKIE, encodedText)
    }

    Store.prototype.$removeAuthCookie = () => {
        if (process.server) {
            if (res.headersSent)
                return
            new Cookies(req, res).set(COOKIE, '', { expires: new Date(1) })
        } else 
            jsCookies.remove(COOKIE)
    }

    Store.prototype.$readAuthCookie = () => {
        let cookieValue
        
        if (process.server) 
            cookieValue = new Cookies(req, res).get(COOKIE)
        else 
            cookieValue = jsCookies.get(COOKIE)
        
        if (!cookieValue)
            return null

        const decodedText = new Buffer(cookieValue, 'base64').toString('ascii')
        const parts = decodedText.split('|')
        const parsedValue = parts.length ? JSON.parse(parts[0]) : {}
        // console.log('readAuthCookie', parsedValue)
        return parsedValue
    }
}