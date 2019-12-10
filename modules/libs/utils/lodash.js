const _ = require('lodash')

_.mixin({
  isPromise: (obj) => {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
  }
})

_.mixin({
  readyPromise: (data) => {
    return new Promise(function (res, rej) { res(data) })
  }
})

_.mixin({
  noDuplicatedValues: (array, value, cb) => {
    if (!_.isFunction(cb)) {
      cb = function (value, changed_value, index, array) {
        if (_.indexOf(array, changed_value) < 0) return true
        return value + '_' + index
      }
    }
    const _limit = 100000
    let index = 0
    let new_value = value
    let new_value_check = new_value

    while (_limit > index) {
      index++
      new_value_check = cb(value, new_value, index, array)
      if (new_value_check === true) return new_value // found a free value
      new_value = new_value_check
    }
    return null
  }
})

_.mixin({
  truncateStart: (string, options) => {
    options = _.merge({
      length: 30,
      omission: '...'
    }, options)
    if (string.length <= options.length) return string
    return options.omission + string.substring(string.length - options.length + 1)
  }
})

_.mixin({
  splitValues: (str, sep) => {
    const _sArray = []
    if (_.isNil(sep)) sep = ','
    if (_.isString(str)) {
      str = _.trim(str)
      const _tmp = str.split(sep)
      _tmp.forEach((v) => {
        v = _.trim(v)
        if (v.length > 0) _sArray.push(v)
      })
    }
    return _sArray
  }
})

module.exports = _
