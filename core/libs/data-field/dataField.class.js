const Events = require('events')
const validator = require('./validator')

const ACCEPTED_EVENTS = [ 'change' ]

/* schema docs: https://www.npmjs.com/package/fastest-validator */

class DataFieldError extends Error {
    constructor(errors) {
        super();
        this.errors = errors
        this.message = ''
        errors.forEach((e) => {
            this.message += `[${e.type}] ${e.message} - Invalid value: ${e.expected}\n`
        })
    }

    getByType(type) {
        this.errors.some(function(e) {
            if(e.type === type) return e
        })
    }

    getByField(field) {
        this.errors.some(function(e) {
            if(e.field.endsWith(`.${field}`)) return e
        })
    }
}


class DataField {

    constructor ({ name, schema, value, strict }) {
        this.name = name
        this.eventEmitter = new Events()

        this.schema = { [name]: schema }
        if(strict !== false) {
            this.schema.$$strict = true /* no additional properties allowed */
        }

        this.check = validator.compile(this.schema)
        this.value = { [this.name]: null }
        this.set(value)
    }

    validate (value) {
        value = { [this.name]: value }
        return this.check(value)
    }

    set (value) {
        const errors = this.validate(value)
        if(errors === true) {
            const oldValue = this.get()
            const newValue = value
            this.value = { [this.name]: value }
            this.eventEmitter.emit('change',{ fieldName: this.name, newValue, oldValue })
            return true
        }
        throw new DataFieldError(errors)
    }

    get () {
        return this.value[this.name]
    }

    on (eventName, cb) {
        if (!ACCEPTED_EVENTS.includes(eventName)) {
            throw new Error(`Unrecognized event '${eventName}' for ${this.constructor.name} '${this.name}'`)
        }
        this.eventEmitter.on(eventName, cb)
    }
}

module.exports = DataField
