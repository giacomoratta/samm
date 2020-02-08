const _ = require('lodash')

const customFn = {}

customFn['array'] = {}
customFn['array'].add = function (field, value, index) {
  const array = field.rawValue
  if(index === undefined) array.push(value)
  else if(index === 0) array.unshift(value)
  else array.splice(Math.min(index, array.length), 0, value)
  field.rawValue = array
}
customFn['array'].remove = function (field, value, index) {
  const array = field.rawValue
  if(array.length === 0) return
  if(value) {
    for(let i=array.length-1; i>=0; i--) {
      if(array[i] === value) array.splice(i, 1)
    }
  } else if(index !== undefined) {
    if(index === 0) array.shift(value)
    else array.splice(index, 1)
  } else {
    array.pop()
  }
  field.rawValue = array
}

customFn['object'] = {}
customFn['object'].add = function (field, key, value) {}
customFn['object'].remove = function (field, key) {}

module.exports = {
  customFn
}
