const FastestValidator = require('fastest-validator')
const { DataField } = require('./dataField.class')

const fvRules = ['any', 'array', 'boolean', 'date', 'email', 'enum', 'forbidden', 'number', 'object', 'string', 'url', 'uuid', 'mac', 'luhn']
const fvRulesNotSupported = ['function']

class DataFieldFactory {
  constructor () {
    this._validator = null
    this._messages = { }
    this._fieldDefinitions = {}
    this._fieldTypes = { }
  }

  initFactory () {
    this._validator = new FastestValidator({
      messages: this._messages
    })
    Object.keys(this._fieldDefinitions).forEach((k) => {
      this._fieldTypes[k] = this._fieldDefinitions[k](this._validator)
      if (this._fieldTypes[k].$validate) {
        if (fvRules.indexOf(k) >= 0) {
          throw new Error(`Field type '${k}' is a built-in type and cannot have a custom validator.`)
        }
        this._validator.add(k, this._fieldTypes[k].$validate)
      } else if (fvRules.indexOf(k) === -1) {
        throw new Error(`Field type '${k}' does not have a validator in its definition.`)
      }
    })
  }

  define (fieldType, defineFn) {
    if (!fieldType || !defineFn) {
      throw new Error('fieldType and defineFn are mandatory arguments.')
    }
    if (fvRulesNotSupported.indexOf(fieldType) >= 0) {
      throw new Error(`Field type ${fieldType} is not supported as DataField.`)
    }
    if (this._fieldDefinitions[fieldType]) {
      throw new Error(`Field type ${fieldType} already exists.`)
    }
    this._fieldDefinitions[fieldType] = defineFn
  }

  messages (dict) {
    const oldDict = this._messages
    this._messages = {
      ...oldDict,
      ...dict
    }
  }

  create ({ name, schema, value, description = '' }) {
    return new DataField({
      name,
      schema,
      value,
      description,
      validator: this._validator,
      customFn: {
        ...this._fieldTypes[schema.type],
        $validate: null
      }
    })
  }
}

module.exports = {
  DataFieldFactory
}
