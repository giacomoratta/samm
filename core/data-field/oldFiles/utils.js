const UNDEFINED_FIELD_VALUE = null

const fixSchema = function (schema) {
  if (schema.type === 'circularArray' || schema.type === 'array') {
    schema.arrayDirection = schema.arrayDirection || 'bottom'
  }
  return schema
}

const addToArray = function (array, schema, index, value) {
  if (schema.type === 'array') {
    if (!array) array = []
    if (schema.max !== undefined && array.length === schema.max) {
      return UNDEFINED_FIELD_VALUE /* error - try to add when the array is full */
    }
    if (index) {
      if (index >= 0 && (schema.max === undefined || index < schema.max)) array.splice(Math.min(index, array.length), 0, value)
      else return UNDEFINED_FIELD_VALUE /* error - try to add to index higher than schema.max */
    } else if (schema.arrayDirection === 'bottom') array.push(value)
    else if (schema.arrayDirection === 'top') array.unshift(value)
    else return UNDEFINED_FIELD_VALUE
    return array
  }
  if (schema.type === 'circularArray') {
    if (!array) array = []
    if (schema.type === 'circularArray' && array.length === schema.max) array = removeFromArray(array, schema, index)
    if (schema.arrayDirection === 'bottom') array.push(value)
    else if (schema.arrayDirection === 'top') array.unshift(value)
    else return UNDEFINED_FIELD_VALUE
    return array
  }
  return null
}

const removeFromArray = function (array, schema, index) {
  if (schema.type === 'array') {
    if (!array || array.length < 1) return []
    if (index) {
      if (index >= 0 && index < array.length && (schema.max === undefined || index < schema.max)) array.splice(index, 1)
      else return UNDEFINED_FIELD_VALUE /* error - try to add to index higher than schema.max */
    } else if (schema.arrayDirection === 'bottom') array.pop()
    else if (schema.arrayDirection === 'top') array.shift()
    else return UNDEFINED_FIELD_VALUE
    return array
  } else if (schema.type === 'circularArray') {
    if (!array || array.length < 1) return []
    if (schema.arrayDirection === 'bottom') array.shift()
    else if (schema.arrayDirection === 'top') array.pop()
    else return UNDEFINED_FIELD_VALUE
    return array
  }
  return null
}

const addToObject = function (object, key, value, schema) {
  if (schema.type === 'object') {
    if (!object) object = {}
    object[key] = value
    return object
  }
  return null
}

const removeFromObject = function (object, key, schema) {
  if (schema.type === 'object') {
    if (!object) return null
    delete object[key]
    return object
  }
  return null
}

const setDescription = function (mainText, schema) {
  const description = []
  if (!mainText) mainText = ' '
  description.push(mainText)
  Object.keys(schema).forEach((k) => {
    if (k === 'default') return
    description.push(`- ${k}: ${schema[k]} `)
  })
  return description
}

module.exports = {
  UNDEFINED_FIELD_VALUE,
  fixSchema,
  addToArray,
  removeFromArray,
  addToObject,
  removeFromObject,
  setDescription
}
