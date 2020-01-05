const _ = require('lodash')

_.mixin({
  isStrictObject: (obj) => {
    return (_.isObject(obj) && obj.constructor === Object)
  }
})

_.mixin({
  isPromise: (obj) => {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
  }
})

_.mixin({
  readyPromise: (data) => {
    return new Promise(function (resolve, reject) { resolve(data) })
  }
})

_.mixin({
  noDuplicatedValues: (array, value, cb) => {
    if (!_.isFunction(cb)) {
      cb = function (value, changedValue, index, array) {
        if (_.indexOf(array, changedValue) < 0) return true
        return value + '_' + index
      }
    }
    const _limit = 100000
    let index = 0
    let newValue = value
    let newValueCheck = newValue

    while (_limit > index) {
      index++
      newValueCheck = cb(value, newValue, index, array)
      if (newValueCheck === true) return newValue // found a free value
      newValue = newValueCheck
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

module.exports = {
  _
}
