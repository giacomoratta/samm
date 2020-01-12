const Events = require('events')
const validator = require('./validator')
const { DataFieldError } = require('./dataField.error')
const transform = require('./transform')
const dataFieldUtils = require('./utils')
const { fileUtils } = require('../utils/file.utils')
const _ = require('lodash')

const ACCEPTED_EVENTS = ['change']
const UNDEFINED_FIELD_VALUE = dataFieldUtils.UNDEFINED_FIELD_VALUE

/* Extra properties
 *   - schema docs: https://www.npmjs.com/package/fastest-validator
 *   - see validator.js
 *   - schema.readOnly (boolean)
 */

class DataField {
  constructor ({ name, schema, value, description = '' }) {
    this.name = name
    this.eventEmitter = new Events()
    this._original_data = _.cloneDeep({ schema, value, description })
    this.init(this._original_data)
  }

  changeSchema (schemaDiff) {
    const schema = _.cloneDeep(_.merge(this.schema[this.name], schemaDiff))
    const isDefaultValue = this.isDefaultValue
    const value = this.value[this.name]
    const description = this.description[0]
    this.init({ schema, value, description })
    this.isDefaultValue = isDefaultValue
  }

  reset () {
    this.init(this._original_data)
  }

  init ({ schema, value, description = '' }) {
    schema = dataFieldUtils.fixSchema(_.cloneDeep(schema))

    this.isDefaultValue = false
    this.defaultValue = UNDEFINED_FIELD_VALUE
    if (!_.isNil(schema.default) && _.isNil(value)) {
      value = schema.default
      this.defaultValue = _.cloneDeep(value)
      this.isDefaultValue = true
    }

    this.schema = { [this.name]: schema }
    this.check = validator.compile(this.schema)
    this.value = { [this.name]: UNDEFINED_FIELD_VALUE }
    this.tranformFn = transform.getFieldTransformFn(schema)
    this.description = dataFieldUtils.setDescription(description, schema)

    if (this.isDefaultValue === true) {
      this.set(value, { overwrite: true })
      this.isDefaultValue = true
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

  unset () {
    this.value = { [this.name]: UNDEFINED_FIELD_VALUE }
  }

  isUnset () {
    // return this.value[this.name] === UNDEFINED_FIELD_VALUE
    return this.get() === UNDEFINED_FIELD_VALUE
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
      this.isDefaultValue = false
      this.eventEmitter.emit('change', { fieldName: this.name, newValue, oldValue })
      return true
    }
    throw new DataFieldError(errors)
  }

  get (finalValue = true) {
    if (this.isDefaultValue === true || this.value[this.name] === UNDEFINED_FIELD_VALUE) {
      return UNDEFINED_FIELD_VALUE
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
      if (!value) {
        value = key
        key = null
      }
      newValue = dataFieldUtils.addToArray(this.get(), this.schema[this.name], key, value)
    } else if (this.schema[this.name].type === 'object') {
      newValue = dataFieldUtils.addToObject(this.get(), key, value, this.schema[this.name])
    }
    if (newValue === UNDEFINED_FIELD_VALUE) return false
    return this.set(newValue)
  }

  remove (key) {
    let newValue
    if (this.schema[this.name].type === 'array' || this.schema[this.name].type === 'circularArray') {
      newValue = dataFieldUtils.removeFromArray(this.get(), this.schema[this.name], key)
    } else if (this.schema[this.name].type === 'object') {
      newValue = dataFieldUtils.removeFromObject(this.get(), key, this.schema[this.name])
    }
    if (newValue === UNDEFINED_FIELD_VALUE) return false
    return this.set(newValue)
  }

  clean () {
    if (this.isUnset()) return null
    if (this.schema[this.name].type === 'absFilePath' || this.schema[this.name].type === 'relFilePath') {
      return fileUtils.removeFileSync(this.get()) === true
    }
    if (this.schema[this.name].type === 'absDirPath' || this.schema[this.name].type === 'relDirPath') {
      return fileUtils.removeDirSync(this.get()) === true
    }
    return null
  }
}

module.exports = {
  DataField
}
