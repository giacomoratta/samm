const Events = require('events')
// const validator = require('./oldFiles/validator')
const { DataFieldError } = require('../../data-field-old1/dataField.error')
// const transform = require('./oldFiles/transform')
// const dataFieldUtils = require('./oldFiles/utils')
// const { fileUtils } = require('../utils/file.utils')
const _ = require('lodash')

const ACCEPTED_EVENTS = ['change']
const UNDEFINED_FIELD_VALUE = null

// todo: document this!
/* Extra properties
 *   - schema docs: https://www.npmjs.com/package/fastest-validator
 *   - see validator.js
 *   - schema.readOnly (boolean)
 */

class DataField {
  constructor ({ name, schema, value, description = '', validator, getter, setter, customFn }) {
    /* Preliminary error check */
    if ((value === undefined && schema.default === undefined) || value === null || schema.default === null) {
      throw new DataFieldError('One of value or schema.default must be defined and not null.')
    }

    /* @Public properties */
    this.get = null
    this.set = null
    this.fn = {}

    /* @Private properties */
    this._name = name
    this._schema = null
    this._description = ''
    this._value = null
    this._eventEmitter = new Events()
    this._factoryValidator = validator
    this._getter = getter
    this._setter = setter
    this._originalConfig = _.cloneDeep({ schema, value, description })
    this._defaultValue = null
    this._isDefaultValue = false

    /* define this.get() */
    if (this._getter) this.get = () => { return this._getter(this.rawValue, this._schema) }
    else this.get = () => { return this.rawValue }

    /* define this.set() */
    if (this._setter) this.set = (value) => { return this._setValue(this._setter(value, this._schema)) }
    else this.set = (value) => { return this._setValue(value) }

    /* define this.fn... */
    this._setCustomFn(customFn)

    /* Real initialization of the DataField object */
    this._init(this._originalConfig)
  }

  get name () { return this._name }
  get description () { return this._description }

  get copyValue () { return _.cloneDeep(this.rawValueRef) }
  get rawValue () { return this._isDefaultValue !== true ? this._value : UNDEFINED_FIELD_VALUE }
  set rawValue (value) { return this._setValue(value) }

  get unset () { return this.rawValueRef === UNDEFINED_FIELD_VALUE }
  set unset (status) { if (status === true) this._value = UNDEFINED_FIELD_VALUE }

  get schema () { return _.cloneDeep(this._schema[this._name]) }
  set schema (schemaDiff) {
    const schema = _.cloneDeep(_.merge(this._schema[this._name], schemaDiff))
    const isDefaultValue = this._isDefaultValue
    const value = this._value
    const description = this._description[0]
    this._init({ schema, value, description })
    this._isDefaultValue = isDefaultValue
  }

  reset () {
    this._init(this._originalConfig)
  }

  validate (value) {
    return this._validate({ [this._name]: value })
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new DataFieldError(`Unrecognized event '${eventName}' for ${this.constructor._name} '${this._name}'`)
    }
    this._eventEmitter.on(eventName, cb)
  }

  /* @Private methods */

  _init ({ schema, value, description = '' }) {
    schema = _.cloneDeep(schema)

    this._isDefaultValue = false
    this._defaultValue = UNDEFINED_FIELD_VALUE
    if (!_.isNil(schema.default) && _.isNil(value)) {
      value = schema.default
      this._defaultValue = _.cloneDeep(value)
      this._isDefaultValue = true
    }

    this._schema = { [this._name]: schema }
    this._validate = this._factoryValidator.compile(this._schema)
    this._value = UNDEFINED_FIELD_VALUE
    this._description = this._setDescription(description, schema)

    if (this._setter) value = this._setter(value, this._schema)

    if (this._isDefaultValue === true) {
      this._setValue(value, true)
      this._isDefaultValue = true
      delete schema.default
      return
    }
    this._setValue(value, true)
  }

  _setCustomFn (customFn) {
    const dataField = this

    Object.keys(customFn).forEach((action) => {
      if (!customFn[action]) return
      this.fn[action] = function () { return customFn[action](dataField, ...arguments) }
    })
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

  _setValue (value, overwrite) {
    if (value === undefined || value === null) {
      throw new DataFieldError('value must be defined and not null.')
    }
    if (overwrite !== true && this._schema[this._name].readOnly === true) {
      throw new DataFieldError(`Field '${this._name}' is read-only!`)
    }
    const errors = this.validate(value)
    if (errors === true) {
      const oldValue = this.rawValueRef
      const newValue = _.cloneDeep(value)
      this._value = newValue
      this._isDefaultValue = false
      this._eventEmitter.emit('change', { fieldName: this._name, newValue, oldValue })
      return true
    }
    throw new DataFieldError(errors)
  }

  // clean () {
  //   if (this.isUnset()) return null
  //   if (this._schema[this._name].type === 'absFilePath' || this._schema[this._name].type === 'relFilePath') {
  //     return fileUtils.removeFileSync(this.get()) === true
  //   }
  //   if (this._schema[this._name].type === 'absDirPath' || this._schema[this._name].type === 'relDirPath') {
  //     return fileUtils.removeDirSync(this.get()) === true
  //   }
  //   return null
  // }
}

module.exports = {
  DataField
}
