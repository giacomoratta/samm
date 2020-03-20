const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')
const { ProjectError } = require('./project.error')

class Project {
  constructor () {
    this._name = null
    this._path = null
  }

  get name () {
    return this._name
  }

  get path () {
    return this._path
  }

  set path (projectPath) {
    // return this._path
  }

  isValid () {
    return this._name && this._path
  }

  async copyFrom (projectObj) {
    if (!(projectObj instanceof Project)) {
      throw new TypeError('projectObj must be instance of Project class.')
    }
    const result = await fileUtils.copyDirectory(projectObj.path, this.path)
    if (result.err) throw result.err

    // todo: _findFilesWithName and return array with absPath

    return result.pathTo
  }

  async findFilesByName (name) {
    // todo: recursive optional argument?
    // this.path
  }

  async fixInternalFileNames (array) {
    // this.path
  }

  _setFromProjectPath (projectPath) {
    if (!fileUtils.isAbsolutePath(projectPath)) {
      throw new ProjectError(`Project path is not an absolute path! ${projectPath}`)
    }
    if (!fileUtils.directoryExistsSync(projectPath) && !fileUtils.fileExistsSync(projectPath)) {
      throw new ProjectError(`Project path does not exist! ${projectPath}`)
    }
    const parsedPath = path.parse(projectPath)
    this._name = parsedPath.base
    this._path = projectPath
  }

  fromJson (data) {
    this._name = data.name
    this._path = data.path
  }

  toJson () {
    return {
      name: this._name,
      path: this._path
    }
  }
}

module.exports = {
  Project
}
