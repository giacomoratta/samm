const Events = require('events')
const { DataFieldError } = require('./dataField.error')
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
  constructor ({ name, schema, value, description = '', validator, getter, setter, cleaner, customFn }) {
    /* @Public properties */
    this.get = null
    this.set = null
    this.fn = {}

    /* @Private properties */
    this._name = name
    this._schema = null
    this._description = ''
    this._value = UNDEFINED_FIELD_VALUE
    this._eventEmitter = new Events()
    this._factoryValidator = validator
    this._getter = getter
    this._setter = setter
    this._cleaner = cleaner
    this._originalConfig = _.cloneDeep({ schema, value, description })

    /* define this.get() */
    if (this._getter) this.get = () => { return this._getter(this.rawValue, this.schema) }
    else this.get = () => { return this.rawValue }

    /* define this.set() */
    if (this._setter) this.set = (value) => { return this._setValue(this._setter(value, this.schema)) }
    else this.set = (value) => { return this._setValue(value) }

    /* define this.clean() */
    if (this._cleaner) this.clean = () => { return this._cleaner(value, this.schema) }
    else this.clean = () => { }

    /* define this.fn... */
    this._setCustomFn(customFn)

    /* Real initialization of the DataField object */
    this._init(this._originalConfig)
  }

  get name () { return this._name }
  get description () { return this._description }

  get rawValue () { return _.cloneDeep(this.rawValueRef) }
  set rawValue (value) { return this._setValue(value, true) }
  get rawValueRef () { return this._value }

  get unset () { return this.rawValueRef === UNDEFINED_FIELD_VALUE }
  set unset (status) { if (status === true) this._value = UNDEFINED_FIELD_VALUE }

  get schema () { return this._schema[this._name] }
  set schema (difference) {
    const schema = _.cloneDeep(_.merge(this._schema[this._name], difference))
    const value = this._value
    const description = this._description[0]
    this._init({ schema, value, description })
  }

  reset () {
    this.clean()
    this._init(this._originalConfig)
  }

  validate (value) {
    if (value === undefined || value === null) return true
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
    this._schema = { [this._name]: _.cloneDeep(schema) }
    this._validate = this._factoryValidator.compile(this._schema)
    this._description = this._setDescription(description, this.schema)

    if (this._setter) value = this._setter(value, this._schema)

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
      let schemaString = schema[k]
      if (_.isObject(schema[k]) || _.isArray(schema[k])) schemaString = JSON.stringify(schema[k])
      description.push(`- ${k}: ${schemaString}`)
    })
    return description
  }

  _setValue (value, overwrite) {
    if (value === undefined || value === null) {
      this.unset = true
      return true
    }
    if (overwrite !== true && this._schema[this._name].readOnly === true) {
      throw new DataFieldError(`Field '${this._name}' is read-only!`)
    }
    const errors = this.validate(value)
    if (errors === true) {
      const oldValue = this.rawValueRef
      const newValue = _.cloneDeep(value)
      this._value = newValue
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
