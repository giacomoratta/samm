const path = require('path')
const { PathInfo } = require('../../core/path-info')
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

  get unset () {
    return !(this._name && this._path)
  }

  async set (projectPath, create = false) {
    this._name = null
    this._path = null
    const pathInfo = new PathInfo()

    if (create === true && await fileUtils.directoryExists(projectPath) !== false) {
      throw new ProjectError(`A project already exists in ${projectPath}.`)
    }

    if (await pathInfo.set({ absolutePath: projectPath }) !== true) {
      throw new ProjectError(`Cannot set ${projectPath} as project path.`)
    }

    if (!pathInfo.isDirectory) {
      throw new ProjectError('Project must be a directory')
    }

    this._name = pathInfo.name
    this._path = pathInfo.path
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
