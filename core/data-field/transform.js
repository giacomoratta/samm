const path = require('path')

const relDirPathTransform = function (value, schema) {
  if(!value) return
  return path.join(schema.basePath,value)
}

const relFilePathTransform = relDirPathTransform

module.exports = {
  relDirPathTransform,
  relFilePathTransform,

  getFieldTransformFn: function(schema) {
    if(schema.type === 'relDirPath') return relDirPathTransform
    if(schema.type === 'relFilePath') return relFilePathTransform
  }
}
