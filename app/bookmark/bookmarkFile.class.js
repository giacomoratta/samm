const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { SampleSet: BookmarkSet } = require('../sample/sampleSet.class')

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
