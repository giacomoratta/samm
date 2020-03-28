const { PathInfo } = require('../../core/path-info')
const { fileUtils } = require('../../core/utils/file.utils')
const { ProjectError } = require('./project.error')

class Project {
  constructor () {
    this._pathInfo = new PathInfo()
  }

  get name () {
    return this._pathInfo.name
  }

  get path () {
    return this._pathInfo.path
  }

  /**
   * Set the project object by its path
   * @param {string} projectPath
   * @throws {PathInfoError, ProjectError}
   * @returns {Promise<boolean>}
   */
  async set (projectPath) {
    if (await this._pathInfo.set({ absolutePath: projectPath }) !== true) {
      throw new ProjectError(`Cannot set ${projectPath} as project path.`)
    }
    if (!this._pathInfo.isDirectory) {
      throw new ProjectError('Project must be a directory')
    }
    return true
  }

  async copyTo ({ projectName, projectPath }) {
    // todo
    // do not create if already exists
    if (await fileUtils.directoryExists(projectPath) !== false) {
      throw new ProjectError(`A project already exists in ${projectPath}.`)
    }
  }

  async copyFrom (projectObj) {
    if (!(projectObj instanceof Project)) {
      throw new TypeError('projectObj must be instance of Project class.')
    }
    if (projectObj.unset) {
      throw new ProjectError('projectObj is not set.')
    }
    if (await fileUtils.directoryExists(projectObj.path)) {

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

  isValid () {
    return this._pathInfo !== null && this._pathInfo.isSet()
  }

  isEqualTo (obj) {
    return this._pathInfo.isEqualTo(obj._pathInfo)
  }

  fromJson (data) {
    this._pathInfo.fromJson(data.pathInfo)
  }

  toJson () {
    return {
      pathInfo: this._pathInfo.toJson()
    }
  }
}

module.exports = {
  Project
}
