const path = require('path')

const relDirPathTransform = function (value, schema) {
  if (!value) return
  return path.join(schema.basePath, value)
}

const relFilePathTransform = relDirPathTransform

const getFieldTransformFn = function(schema) {
  if(!schema) return null
  if(schema.type === 'array' && schema.items) {
    const transformFn = getFieldTransformFn(schema.items)
    if(transformFn) return function (value, schema) {
      const newArray = []
      value.forEach((item) => {
        newArray.push(transformFn(item, schema.items))
      })
      return newArray
    }
  }
  else if(schema.type === 'object' && schema.props) {
    const transformFnProps = {}
    let flag = false
    Object.keys(schema.props).forEach((k) => {
      transformFnProps[k] = getFieldTransformFn(schema.props[k])
      flag = true
    })
    if(!flag) return null
    return function (value, schema) {
      const newObject = {}
      Object.keys(value).forEach((k) => {
        newObject[k] = ( transformFnProps[k] ? transformFnProps[k](value[k],schema.props[k]) : value[k] )
      })
      return newObject
    }

  }
  else if (schema.type === 'relDirPath') return relDirPathTransform
  else if (schema.type === 'relFilePath') return relFilePathTransform
  return null
}

module.exports = {
  relDirPathTransform,
  relFilePathTransform,

  // getFieldTransformFn: function (schema) {
  //   if (schema.type === 'relDirPath') return relDirPathTransform
  //   if (schema.type === 'relFilePath') return relFilePathTransform
  // },

  getFieldTransformFn
}
