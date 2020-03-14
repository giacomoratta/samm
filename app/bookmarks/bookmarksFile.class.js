const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { BookmarksSet } = require('./bookmarksSet.class')

class BookmarksFile extends JsonCollectionFile {
  constructor (filePath) {
    super({
      filePath,
      orderType: 'ASC',
      collectionType: 'object',
      itemsClass: BookmarksSet
    })
  }
}

module.exports = {
  BookmarksFile
}
