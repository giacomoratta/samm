const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')

class PathQueryFile extends JsonCollectionFile {
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
  PathQueryFile
}
