const Events = require('events')
// const validator = require('./oldFiles/validator')
const { DataFieldError } = require('./dataField.error')
// const transform = require('./oldFiles/transform')
// const dataFieldUtils = require('./oldFiles/utils')
// const { fileUtils } = require('../utils/file.utils')
const _ = require('lodash')

const ACCEPTED_EVENTS = ['change']
const UNDEFINED_FIELD_VALUE = null

/* Extra properties
 *   - schema docs: https://www.npmjs.com/package/fastest-validator
 *   - see validator.js
 *   - schema.readOnly (boolean)
 */

class DataField {
  constructor ({ name, schema, value, description = '', validator, actions }) {
    this.name = name
    this.eventEmitter = new Events()
    this.validator = validator
    this.actions = actions
    this._original_data = _.cloneDeep({ schema, value, description })

    if (value === undefined && schema.default === undefined) {
      throw new DataFieldError('One of value or schema.default must be defined')
    }
    this.init(this._original_data)
  }

  reset () {
    this.init(this._original_data)
  }

  init ({ schema, value, description = '' }) {
    schema = _.cloneDeep(schema)

    this.isDefaultValue = false
    this.defaultValue = UNDEFINED_FIELD_VALUE
    if (!_.isNil(schema.default) && _.isNil(value)) {
      value = schema.default
      this.defaultValue = _.cloneDeep(value)
      this.isDefaultValue = true
    }

    this.schema = { [this.name]: schema }
    this._validate = this.validator.compile(this.schema)
    this.value = { [this.name]: UNDEFINED_FIELD_VALUE }
    this.description = this._setDescription(description, schema)

    if (this.isDefaultValue === true) {
      this._setValue(value, true)
      this.isDefaultValue = true
      delete schema.default
      return
    }
    this._setValue(value, true)
  }

  getSchema () {
    return this.schema[this.name]
  }

  changeSchema (schemaDiff) {
    const schema = _.cloneDeep(_.merge(this.schema[this.name], schemaDiff))
    const isDefaultValue = this.isDefaultValue
    const value = this.value[this.name]
    const description = this.description[0]
    this.init({ schema, value, description })
    this.isDefaultValue = isDefaultValue
  }

  describe (text = false, indent = '') {
    if (text === false) return this.description
    return `${indent}${this.description.join(`\n${indent}`)}`
  }

  validate (value) {
    return this._validate({ [this.name]: value })
  }

  unset () {
    this.value = { [this.name]: UNDEFINED_FIELD_VALUE }
  }

  isUnset () {
    return this._getValue() === UNDEFINED_FIELD_VALUE
  }

  get () {
    return this._getValue()
  }

  set (value) {
    return this._setValue(value)
  }

  _setValue (value, overwrite) {
    if (overwrite !== true && this.schema[this.name].readOnly === true) {
      throw new DataFieldError(`Field '${this.name}' is read-only!`)
    }
    const errors = this.validate(value)
    if (errors === true) {
      const oldValue = this._getValue(false)
      const newValue = _.cloneDeep(value)
      this.value = { [this.name]: newValue }
      this.isDefaultValue = false
      this.eventEmitter.emit('change', { fieldName: this.name, newValue, oldValue })
      return true
    }
    throw new DataFieldError(errors)
  }

  _getValue (finalValue = true) {
    if (this.isDefaultValue === true || this.value[this.name] === UNDEFINED_FIELD_VALUE) {
      return UNDEFINED_FIELD_VALUE
    }
    if (finalValue !== false && this.tranformFn) return this.tranformFn(this.value[this.name], this.schema[this.name])
    return this.value[this.name]
  }

  _setDescription (mainText, schema) {
    const description = []
    if (!mainText) mainText = ' '
    description.push(mainText)
    Object.keys(schema).forEach((k) => {
      if (k === 'default') return
      description.push(`- ${k}: ${schema[k]} `)
    })
    return description
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new DataFieldError(`Unrecognized event '${eventName}' for ${this.constructor.name} '${this.name}'`)
    }
    this.eventEmitter.on(eventName, cb)
  }

  // add (key, value) {
  //   let newValue
  //   if (this.schema[this.name].type === 'array' || this.schema[this.name].type === 'circularArray') {
  //     if (!value) {
  //       value = key
  //       key = null
  //     }
  //     newValue = dataFieldUtils.addToArray(this.get(), this.schema[this.name], key, value)
  //   } else if (this.schema[this.name].type === 'object') {
  //     newValue = dataFieldUtils.addToObject(this.get(), key, value, this.schema[this.name])
  //   }
  //   if (newValue === UNDEFINED_FIELD_VALUE) return false
  //   return this.set(newValue)
  // }
  //
  // remove (key) {
  //   let newValue
  //   if (this.schema[this.name].type === 'array' || this.schema[this.name].type === 'circularArray') {
  //     newValue = dataFieldUtils.removeFromArray(this.get(), this.schema[this.name], key)
  //   } else if (this.schema[this.name].type === 'object') {
  //     newValue = dataFieldUtils.removeFromObject(this.get(), key, this.schema[this.name])
  //   }
  //   if (newValue === UNDEFINED_FIELD_VALUE) return false
  //   return this.set(newValue)
  // }

  // clean () {
  //   if (this.isUnset()) return null
  //   if (this.schema[this.name].type === 'absFilePath' || this.schema[this.name].type === 'relFilePath') {
  //     return fileUtils.removeFileSync(this.get()) === true
  //   }
  //   if (this.schema[this.name].type === 'absDirPath' || this.schema[this.name].type === 'relDirPath') {
  //     return fileUtils.removeDirSync(this.get()) === true
  //   }
  //   return null
  // }
}

module.exports = {
  DataField
}
