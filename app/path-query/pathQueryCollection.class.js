const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')

class PathQueryCollection extends JsonCollectionFile {
  constructor (filePath) {
    super({
      filePath,
      orderType: 'ASC',
      collectionType: 'object',
      itemsClass: PathBasedQuery
    })
  }
}

module.exports = {
  PathQueryCollection
}
