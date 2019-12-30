const fixSchema = function (schema) {
  if (schema.type === 'circularArray' || schema.type === 'array') {
    schema.arrayDirection = schema.arrayDirection || 'bottom'
  }
  return schema
}

const addToArray = function (array, value, schema) {
  if (schema.type === 'circularArray' || schema.type === 'array') {
    if (!array) array = []
    if (schema.type === 'circularArray' && array.length === schema.max) array = removeFromArray(array, schema)
    if (schema.arrayDirection === 'bottom') array.push(value)
    else array.unshift(value)
    return array
  }
  return null
}

const removeFromArray = function (array, schema) {
  if (schema.type === 'array') {
    if (!array || array.length < 1) return []
    if (schema.arrayDirection === 'bottom') array.pop()
    else array.shift()
    return array
  } else if (schema.type === 'circularArray') {
    if (!array || array.length < 1) return []
    if (schema.arrayDirection === 'bottom') array.shift()
    else array.pop()
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
  if(!mainText) mainText=' '
  description.push(mainText)
  Object.keys(schema).forEach((k) => {
    if (k === 'default') return
    description.push(`- ${k}: ${schema[k]} `)
  })
  return description
}

module.exports = {
  fixSchema,
  addToArray,
  removeFromArray,
  addToObject,
  removeFromObject,
  setDescription
}
