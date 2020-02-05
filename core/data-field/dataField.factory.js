const _ = require('lodash')
const FastestValidator = require('fastest-validator')

class DataFieldFactory {

  constructor () {
    this._validator = null
    this._messages = { }
    this._fieldDefinitions = { }
    this._fieldTypes = { }
  }

  init () {
    this._validator = new FastestValidator({
      messages: this._messages
    })
    this._fieldDefinitions.forEach((k) => {
      this._fieldTypes[k] = this._fieldDefinitions[k](this._validator)
    })
  }

  define (fieldType, defineFn) {
    // todo: get fastest-validator list
    if(this._fieldDefinitions[fieldType]) {
      throw new Error(`Field type ${fieldType} already exists!`)
    }
    this._fieldDefinitions[fieldType] = defineFn
  }

  messages (dict) {
    const oldDict = this._messages
    this._messages = {
      oldDict,
      ...dict
    }
  }

  ggg () {

  }

  create ({ name, schema, value, description = '' }) {
    return new DataField({
      name,
      schema,
      value,
      description,
      validator: this._validator,
      actions: this._fieldTypes[k]
    })
  }
}

module.exports = {
  DataFieldFactory
}
