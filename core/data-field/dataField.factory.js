const _ = require('lodash')
const FastestValidator = require('fastest-validator')
const { DataField } = require('./dataField.class')
const { customFn } = require('./dataField.customFn')

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
      this._validator.add(k, this._fieldTypes[k].validate)
    })
  }

  define (fieldType, defineFn) {
    // todo: get fastest-validator list
    if (!fieldType || !defineFn) {
      throw new Error('fieldType and defineFn are mandatory arguments.')
    }
    if (this._fieldDefinitions[fieldType]) {
      throw new Error(`Field type ${fieldType} already exists!`)
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

  __generateDeepFn (schema, actionName) {
    if (!schema || !schema.type) return

    /* Custom function */
    if (this._fieldTypes[schema.type] && this._fieldTypes[schema.type][actionName]) return this._fieldTypes[schema.type][actionName]

    /* Array & items */
    if (schema.items) {
      const transformFn = this.__generateDeepFn(schema.items, actionName)
      if (transformFn) {
        return function (value, schema) {
          if (_.isNil(value)) return null
          const newArray = []
          value.forEach((item) => {
            newArray.push(transformFn(item, schema.items))
          })
          return newArray
        }
      }
      return
    }

    /* Object & props */
    if (schema.props) {
      const transformFnProps = {}
      let foundPropsFn = false
      Object.keys(schema.props).forEach((k) => {
        transformFnProps[k] = this.__generateDeepFn(schema.props[k], actionName)
        foundPropsFn = true
      })
      if (!foundPropsFn) return
      return function (value, schema) {
        if (_.isNil(value)) return null
        const newObject = {}
        Object.keys(value).forEach((k) => {
          newObject[k] = (transformFnProps[k] ? transformFnProps[k](value[k], schema.props[k]) : value[k])
        })
        return newObject
      }
    }
  }

  create ({ name, schema, value, description = '' }) {
    // todo: fix schema
    // todo: add fixed actions for basic types
    return new DataField({
      name,
      schema,
      value,
      description,
      validator: this._validator,
      getter: this.__generateDeepFn(schema, 'get'),
      setter: this.__generateDeepFn(schema, 'set'),
      customFn: {
        ...customFn[schema.type],
        ...this._fieldTypes[schema.type],
        get: null,
        set: null,
        validate: null
      }
    })
  }
}

module.exports = {
  DataFieldFactory
}
