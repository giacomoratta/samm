const { JsonCollectionFile } = require('../../core/file-butler/jsonCollectionFile.class')
const { Project } = require('./project.class')

class ProjectHistoryFile extends JsonCollectionFile {
  constructor (filePath) {
    super({
      filePath,
      orderType: 'DESC',
      collectionType: 'array',
      collectionMaxLength: 15,
      itemsClass: Project
    })
  }
}

module.exports = {
  ProjectHistoryFile
}
