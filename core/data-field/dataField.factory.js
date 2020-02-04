class DataFieldFactory {

  constructor () {
    this.validator = null
    this.messages = { }
    this.defines = { }
    this.fields = { }
  }

  init () {
    // new validator
    // add messages
    // add fields = this.defines[fieldType](validator,{ _, fileUtils })
    // check allowed keys in new field definition
  }

  define (fieldType, defineFn) {
    // check fieldType exists
    // this.defines[fieldType] = defineFn
  }

  message () {
  }

  create ({ name, schema, value, description = '' }) {
    // return new DataField(...)
  }
}

module.exports = {
  DataFieldFactory
}
