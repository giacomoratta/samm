const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { BookmarkSet } = require('./bookmarkSet.class')

class BookmarksFile extends JsonCollectionFile {
  constructor (filePath) {
    super({
      filePath,
      orderType: 'ASC',
      collectionType: 'object',
      itemsClass: BookmarkSet
    })
  }
}

module.exports = {
  BookmarksFile
}
