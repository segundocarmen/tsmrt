export class InternalServerError {
    constructor(data) {
        const { message, stack } = data
        this.message = message
        this.stack = stack
    }
}