const Events = require('events')
const validator = require('./validator')
const DataFieldError = require('./dataField.error')
const transform = require('./transform')

const ACCEPTED_EVENTS = ['change']

/* schema docs: https://www.npmjs.com/package/fastest-validator */

class DataField {
  constructor ({ name, schema, value }) {
    this.name = name
    this.eventEmitter = new Events()
    this.schema = { [name]: schema }
    this.check = validator.compile(this.schema)
    this.value = { [this.name]: null }
    this.tranformFn = transform.getFieldTransformFn(schema)
    if (value) this.set(value)
  }

  validate (value) {
    value = { [this.name]: value }
    return this.check(value)
  }

  set (value) {
    const errors = this.validate(value)
    if (errors === true) {
      const oldValue = this.get(false)

      const newValue = value
      // if( this.schema === 'object' ) newValue = deepCopy(value) todo
      // if( this.schema === 'array' ) newValue = deepCopy(value) todo

      this.value = { [this.name]: newValue }
      this.eventEmitter.emit('change', { fieldName: this.name, newValue, oldValue })
      return true
    }
    throw new DataFieldError(errors)
  }

  get (finalValue = true) {
    if (finalValue !== false && this.tranformFn) return this.tranformFn(this.value[this.name], this.schema[this.name])
    return this.value[this.name]
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new DataFieldError(`Unrecognized event '${eventName}' for ${this.constructor.name} '${this.name}'`)
    }
    this.eventEmitter.on(eventName, cb)
  }
}

module.exports = DataField
