const isNil = function(v) { return v===null || v===undefined || typeof v === 'undefined'}

class cliInput {
  constructor (values, command) {
    if(!values || typeof values !== 'object'){
      throw new Error(`invalid 'value' argument: expected object`)
    }
    if(!command || typeof command !== 'string'){
      throw new Error(`invalid 'command' argument: expected string`)
    }
    this.command = command
    this.options = { ...values.options }
    this.params = { ...values }
    delete this.params.options
  }

  hasParam (name) {
    return (!isNil(this.params[name]))
  }

  hasOption (name) {
    return (!isNil(this.options[name]))
  }

  getParam (name, filterFn) {
    if (isNil(this.params[name])) return null
    if (filterFn) return filterFn(this.params[name])
    return this.params[name]
  }

  getOption (name, filterFn) {
    if (isNil(this.options[name])) return null
    if (filterFn) return filterFn(this.options[name])
    return this.options[name]
  }

  filterParams (filterFn) {
    const array = []
    let value
    Object.keys(this.params).forEach((k) => {
      value = filterFn(this.params[k])
      if (!value) return
      array.push(value)
    })
    return array
  }
}

module.exports = cliInput
