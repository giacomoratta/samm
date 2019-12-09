const _ = require('./lodash')
const libUtils = {}

libUtils.sortObjectByValue = (obj) => {
  return _(obj).toPairs().sortBy(1).fromPairs().value()
}

libUtils.sortObjectByKey = (obj) => {
  return _(obj).toPairs().sortBy(0).fromPairs().value()
}

module.exports = libUtils
