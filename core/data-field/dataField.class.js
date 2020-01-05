const Events = require('events')
const validator = require('./validator')
const { DataFieldError } = require('./dataField.error')
const transform = require('./transform')
const dataFieldUtils = require('./utils')
const _ = require('lodash')

const ACCEPTED_EVENTS = ['change']

/* Extra properties
 *   - schema docs: https://www.npmjs.com/package/fastest-validator
 *   - see validator.js
 *   - schema.readOnly (boolean)
 */

class DataField {
  constructor ({ name, schema, value, description = '' }) {
    this.name = name
    this.eventEmitter = new Events()
    this.init({ schema, value, description })
  }

  changeSchema (schemaDiff) {
    const schema = _.cloneDeep(_.merge(this.schema[this.name], schemaDiff))
    const defaultValue = this.defaultValue
    const value = this.value[this.name]
    const description = this.description[0]
    this.init({ schema, value, description })
    this.defaultValue = defaultValue
  }

  init ({ schema, value, description = '' }) {
    schema = dataFieldUtils.fixSchema(_.cloneDeep(schema))

    /* work-around */
    this.defaultValue = false
    if (!_.isNil(schema.default) && _.isNil(value)) {
      value = schema.default
      this.defaultValue = true
    }

    this.schema = { [this.name]: schema }
    this.check = validator.compile(this.schema)
    this.value = { [this.name]: null }
    this.tranformFn = transform.getFieldTransformFn(schema)
    this.description = dataFieldUtils.setDescription(description, schema)

    if (this.defaultValue === true) {
      this.set(value, { overwrite: true })
      this.defaultValue = true
      delete schema.default
      return
    }
    this.set(value, { overwrite: true })
  }

  getSchema () {
    return this.schema[this.name]
  }

  describe (text = false, indent = '') {
    if (text === false) return this.description
    return `${indent}${this.description.join(`\n${indent}`)}`
  }

  validate (value) {
    value = { [this.name]: value }
    return this.check(value)
  }

  set (value, { overwrite = false } = {}) {
    if (overwrite !== true && this.schema[this.name].readOnly === true) {
      throw new DataFieldError(`Field '${this.name}' is read-only!`)
    }
    const errors = this.validate(value)
    if (errors === true) {
      const oldValue = this.get(false)
      const newValue = _.cloneDeep(value)
      this.value = { [this.name]: newValue }
      this.defaultValue = false
      this.eventEmitter.emit('change', { fieldName: this.name, newValue, oldValue })
      return true
    }
    throw new DataFieldError(errors)
  }

  get (finalValue = true) {
    if (this.defaultValue === true) {
      return null
    }
    if (finalValue !== false && this.tranformFn) return this.tranformFn(this.value[this.name], this.schema[this.name])
    return this.value[this.name]
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new DataFieldError(`Unrecognized event '${eventName}' for ${this.constructor.name} '${this.name}'`)
    }
    this.eventEmitter.on(eventName, cb)
  }

  add (key, value) {
    let newValue
    if (this.schema[this.name].type === 'array' || this.schema[this.name].type === 'circularArray') {
      if (!value) value = key
      newValue = dataFieldUtils.addToArray(this.get(), value, this.schema[this.name])
    } else if (this.schema[this.name].type === 'object') {
      newValue = dataFieldUtils.addToObject(this.get(), key, value, this.schema[this.name])
    }
    if (newValue === null) return false
    return this.set(newValue)
  }

  remove (key, value) {
    let newValue
    if (this.schema[this.name].type === 'array' || this.schema[this.name].type === 'circularArray') {
      newValue = dataFieldUtils.removeFromArray(this.get(), this.schema[this.name])
    } else if (this.schema[this.name].type === 'object') {
      newValue = dataFieldUtils.removeFromObject(this.get(), key, this.schema[this.name])
    }
    if (newValue === null) return false
    return this.set(newValue)
  }
}

module.exports = {
  DataField
}
