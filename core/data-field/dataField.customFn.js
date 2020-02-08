const _ = require('lodash')

const customFn = {}

customFn['array'] = {}
customFn['array'].add = function (field, value, index) {}
customFn['array'].remove = function (field, value, index) {}

customFn['object'] = {}
customFn['object'].add = function (field, key, value) {}
customFn['object'].remove = function (field, key) {}

module.exports = {
  customFn
}
