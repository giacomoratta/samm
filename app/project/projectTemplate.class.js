const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')
const { Project } = require('./project.class')
const { ProjectError } = require('./project.error')

class ProjectTemplates {
  constructor (filePath) {
    if (!fileUtils.isAbsolutePath(filePath)) {
      throw new ProjectError(`Project templates path is not an absolute path: ${filePath}`)
    }
    this._filePath = filePath
    this._list = []
  }

  get list () {
    return this._list
  }

  async scan () {
    if (!await fileUtils.directoryExists(this._filePath)) {
      throw new ProjectError(`Project templates path does not exist: ${this._filePath}`)
    }
    const array = []
    await fileUtils.readDirectory(this._filePath, function (array) {
      array.sort(function (a, b) {
        const aName = a.toLowerCase()
        const bName = b.toLowerCase()
        if (aName < bName) return -1
        if (aName > bName) return 1
        return 0
      })
      return array
    }, async (item) => {
      array.push(new Project({ projectPath: path.join(this._filePath, item) }))
    })
    this._list = array
    return array
  }
}

module.exports = {
  ProjectTemplates
}
