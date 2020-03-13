const { JsonCollectionFile } = require('../../core/file-butler/jsonCollection.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')

class PathQueryCollection extends JsonCollectionFile {
  fromJson (jsonData) {
    const obj = new PathBasedQuery()
    obj.fromJson(jsonData)
    return obj
  }

  toJson (obj) {
    return obj.toJson()
  }

  add (label, pathBasedQueryObject) {
    if (!(pathBasedQueryObject instanceof PathBasedQuery)) {
      throw new TypeError('pathBasedQueryObject should be an instance of PathBasedQuery class')
    }
    if (!pathBasedQueryObject.isValid()) return false
    super.add(label, pathBasedQueryObject)
    return true
  }
}

module.exports = {
  PathQueryCollection
}
