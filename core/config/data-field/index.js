const Schema = require('validate')
const Validator = require('fastest-validator')

class DataField {
    constructor({ schema, value }) {
        this.schema = new Schema(schema)
        this.value = null
        this.set(value)
    }

    set(value) {
        const errors = this.schema.validate(value)
        if(!errors) {
            this.value = { ...value }
            return
        }
        console.log(errors)
    }

    get() {
        return {
            ...this.value
        }
    }
}

module.exports = DataField
