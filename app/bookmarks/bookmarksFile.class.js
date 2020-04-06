const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { SampleSet } = require('../sample/sampleSet.class')

class BookmarksFile extends JsonCollectionFile {
  constructor (filePath) {
    super({
      filePath,
      orderType: 'ASC',
      collectionType: 'object',
      itemsClass: SampleSet
    })
  }
}

module.exports = {
  BookmarksFile
}
