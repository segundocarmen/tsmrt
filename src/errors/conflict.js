export class ConflictError {
    constructor(error) {
        const { statusCode, message } = error || {}
        this.code = statusCode
        this.message = message
    } 
}