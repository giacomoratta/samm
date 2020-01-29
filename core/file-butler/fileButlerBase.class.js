const { _ } = require('../utils/lodash.extended')
const { FileButlerError } = require('./fileButlerError.class')
const { fileUtils } = require('../utils/file.utils')

class FileButlerBase {
  constructor (options) {
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
    try {
      await this._removeFile(this._config.filePath)
      this._data = this._config.defaultValue
      this._hasData = false
      return true
    } catch (e) {
      throw e
    }
  }

  _setData (data, doNotClone = false) {
    if (this._config.validityCheck(data) !== true) {
      throw new FileButlerError(`This data is not valid as '${this._config.fileType}'.`)
    }
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
      readFileFn: null,
      writeFileFn: null,
      validityCheck: null,

      /* Optionals */
      cloneFrom: null,
      backupTo: null,
      loadFn: null,
      saveFn: null,

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

    if (!_.isFunction(options.readFileFn)) {
      throw new FileButlerError('\'readFileFn\' option is required and must be a function.')
    }

    if (!_.isFunction(options.writeFileFn)) {
      throw new FileButlerError('\'writeFileFn\' is required and option must be a function.')
    }

    if (!_.isFunction(options.validityCheck)) {
      throw new FileButlerError('\'validityCheck\' is required and option must be a function.')
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

  async _cloneFile () {
    if (!this._config.cloneFrom) return
    try {
      if (await this._fileExists(this._config.filePath)) return
      return await this._copyFile(this._config.cloneFrom, this._config.filePath)
    } catch (e) {
      throw e
    }
  }

  async _backupFile () {
    if (!this._config.backupTo) return
    try {
      if ((await this._fileExists(this._config.filePath)) !== true) return
      return await this._copyFile(this._config.filePath, this._config.backupTo)
    } catch (e) {
      throw e
    }
  }

  _isAbsolutePath (pathString) {
    return fileUtils.fileExists(this._config.filePath)
  }

  _fileExists (pathString) {
    return fileUtils.fileExists(this._config.filePath)
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
    try {
      await this._cloneFile()

      let fileData = await this._readFile(this._config.filePath, this._config.fileEncoding, this._config.fileReadFlag)

      const readFileFnResult = this._config.readFileFn(fileData)
      if (readFileFnResult instanceof Promise) fileData = await readFileFnResult
      else fileData = readFileFnResult

      const loadFnResult = this._config.loadFn(fileData)
      if (loadFnResult instanceof Promise) fileData = await loadFnResult
      else fileData = loadFnResult

      return this._setData(fileData, true)
    } catch (e) {
      throw e
    }
  }

  async save () {
    if (this.empty()) return false
    try {
      await this._backupFile()
      let fileData

      const saveFnResult = this._config.saveFn(fileData)
      if (saveFnResult instanceof Promise) fileData = await saveFnResult
      else fileData = saveFnResult

      const writeFileFnResult = this._config.writeFileFn(fileData)
      if (writeFileFnResult instanceof Promise) fileData = await writeFileFnResult
      else fileData = writeFileFnResult

      return await this._writeFile(fileData, this._config.filePath, this._config.fileEncoding, this._config.fileWriteFlag, this._config.fileMode)
    } catch (e) {
      throw e
    }
  }
}

module.exports = {
  FileButlerBase
}
