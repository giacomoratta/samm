const _ = require('lodash')

class cliParam {
  constructor (values, command, isRawData) {
    this._error = true
    if (isRawData === true) {
      this.initRawData(values, command)
      return
    }
    this.init(values, command)
  }

  isValid () {
    return !this._error
  }

  initRawData (values, command) {
    this.command = command
    this.options = {}
    this.params = { _: [] }
    if (!_.isString(values)) return
    values = values.split(' ')
    for (let i = 0; i < values.length; i++) {
      if (values[i].startsWith('-')) {
        this.options[values[i]] = true
        if (values[i + 1] && !values[i + 1].startsWith('-')) {
          this.options[values[i]] = values[i + 1]
          i++
        }
      } else {
        this.params._.push(values[i])
      }
    }
    // split with space
    // check options and values
    // single values
    this._error = false
  }

  init (values, command) {
    this._error = true
    this.command = null
    this.params = { _: [] }
    if (!_.isObject(values)) return

    this.command = command
    this.options = values.options
    delete values.options
    this.params = values
    this._error = false

    /*
        this.params has the same data-format returned by minimist library.
        {
            _: [ array of values ],
            opt1: true (if does not have a value, just to check the presence)
            opt2: 'value',
            opt2: 12321, (already converted)
            opt2: 123.21
        }
     */
  }

  hasOption (o) {
    return (!_.isNil(this.options[o]))
  }

  get (i) {
    if (!_.isNil(this.params[i])) return this.params[i]
    return null
  }

  getOption (o) {
    if (!_.isNil(this.options[o])) return this.options[o]
    return null
  }

  filterGet (index, cb) {
    const value = this.params._[index]
    if (!value) return null
    return cb(value)
  }

  filterValues (cb) {
    const array = []
    let value
    this.params._.forEach(function (v) {
      value = cb(v)
      if (!value) return
      array.push(value)
    })
    return array
  }
}

module.exports = cliParam
