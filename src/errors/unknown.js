export class UnknownError {
    constructor(status, data) {
        this.data = data
        this.status = status
    }
}