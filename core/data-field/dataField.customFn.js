const _ = require('lodash')

const customFn = {}

customFn['array'] = {}
customFn['array'].add = function (value, index, field) {}
customFn['array'].remove = function (value, index, field) {}

customFn['object'] = {}
customFn['object'].add = function (key, value, field) {}
customFn['object'].remove = function (key, field) {}

module.exports = {
  customFn
}
