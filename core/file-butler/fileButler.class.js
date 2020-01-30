const _ = require('lodash')
const FileButlerError = require('./fileButlerError.class')
const { fileUtils } = require('../utils/file.utils')

class FileButler {
  constructor (options) {
    if (new.target === FileButler) {
      throw new FileButlerError('Cannot construct FileButler instances directly')
    }

    this._config = {}
    this._parseOptions(options)
    this._hasData = false
    this._data = this._config.defaultValue
  }

  get data () {
    return this._data
  }

  set data (data) {
    return this._setData(data)
  }

  empty () {
    return !this._hasData
  }

  async delete () {
    await this._removeFile(this._config.filePath)
    this._data = this._config.defaultValue
    this._hasData = false
  }

  _setData (data, doNotClone = false) {
    if (this._config.validityCheck(data) !== true) return this._hasData
    this._hasData = !_.isNil(data)
    if (!this._hasData) this.data = this._config.defaultValue
    else this.data = (doNotClone === true ? data : _.cloneDeep(data))
    return this._hasData
  }

  _parseOptions (options) {
    options = {

      /* Required */
      filePath: null,
      defaultValue: null,
      validityCheck: null,
      fileToDataFn: null,
      dataToFileFn: null,

      /* Optionals */
      loadFn: null,
      saveFn: null,
      cloneFrom: null,
      backupTo: null,

      /* File properties */
      fileEncoding: 'utf8',
      fileReadFlag: 'r',
      fileWriteFlag: 'w',
      fileMode: 0o666,

      ...options
    }

    if (!options.filePath) {
      throw new FileButlerError('Missing \'filePath\' option.')
    }
    if (!this._isAbsolutePath(options.filePath)) {
      throw new FileButlerError(`'filePath' option must be an absolute path: ${options.filePath} .`)
    }

    if (options.defaultValue === undefined) {
      throw new FileButlerError('Missing \'defaultValue\' option.')
    }

    if (!_.isFunction(options.validityCheck)) {
      throw new FileButlerError('\'validityCheck\' option is required and must be a function.')
    }

    if (options.fileToDataFn || !_.isFunction(options.fileToDataFn)) {
      throw new FileButlerError('\'fileToDataFn\' option is required and must be a function.')
    }

    if (options.dataToFileFn || !_.isFunction(options.dataToFileFn)) {
      throw new FileButlerError('\'dataToFileFn\' option is required and must be a function.')
    }

    if (options.cloneFrom && !this._isAbsolutePath(options.cloneFrom)) {
      throw new FileButlerError(`'cloneFrom' option must be an absolute path: ${options.cloneFrom} .`)
    }

    if (options.backupTo && !this._isAbsolutePath(options.backupTo)) {
      throw new FileButlerError(`'backupTo' option must be an absolute path: ${options.backupTo} .`)
    }

    if (options.loadFn && !_.isFunction(options.loadFn)) {
      throw new FileButlerError('\'loadFn\' option must be a function.')
    }

    if (options.saveFn && !_.isFunction(options.saveFn)) {
      throw new FileButlerError('\'saveFn\' option must be a function.')
    }

    this._config = options
  }

  _isAbsolutePath (pathString) {
    return fileUtils.isAbsolutePath(pathString)
  }

  _fileExists (pathString) {
    return fileUtils.fileExists(pathString)
  }

  _copyFile (pathFrom, pathTo, options) {
    return fileUtils.copyFile(pathFrom, pathTo, options)
  }

  _removeFile (pathString) {
    return fileUtils.removeFile(pathString)
  }

  _readFile (pathString, encoding, flag) {
    return fileUtils.readFile(pathString, encoding, flag)
  }

  _writeFile (fileData, pathString, encoding, flag, mode) {
    return fileUtils.writeFile(pathString, fileData, encoding, flag, mode)
  }

  async load () {
    /* clone file */
    if (this._config.cloneFrom && await this._fileExists(this._config.cloneFrom)) {
      await this._copyFile(this._config.cloneFrom, this._config.filePath)
    }

    let fileData = await this._readFile(this._config.filePath, this._config.fileEncoding, this._config.fileReadFlag)

    const fileToDataFnResult = this._config.fileToDataFn(fileData)
    if (fileToDataFnResult instanceof Promise) fileData = await fileToDataFnResult
    else fileData = fileToDataFnResult

    if (this._config.loadFn) {
      const loadFnResult = this._config.loadFn(fileData)
      if (loadFnResult instanceof Promise) fileData = await loadFnResult
      else fileData = loadFnResult
    }

    return this._setData(fileData, true)
  }

  async save () {
    if (this.empty()) return false

    /* backup file */
    if (this._config.backupTo && await this._fileExists(this._config.filePath)) {
      await this._copyFile(this._config.filePath, this._config.backupTo)
    }

    let fileData

    if (this._config.saveFn) {
      const saveFnResult = this._config.saveFn(fileData)
      if (saveFnResult instanceof Promise) fileData = await saveFnResult
      else fileData = saveFnResult
    }

    const dataToFileFnResult = this._config.dataToFileFn(fileData)
    if (dataToFileFnResult instanceof Promise) fileData = await dataToFileFnResult
    else fileData = dataToFileFnResult

    return this._writeFile(fileData, this._config.filePath, this._config.fileEncoding, this._config.fileWriteFlag, this._config.fileMode)
  }
}

module.exports = FileButler
