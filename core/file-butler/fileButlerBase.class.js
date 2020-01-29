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

  async deleteFile() {
    try {
      return await fileUtils.removeFile(this._config.filePath)
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

  async _readFile(pathString, encoding, flag) {
    try {
      let fileData = await fileUtils.readFile(pathString, encoding, flag)

      const readFileFnResult = this._config.readFileFn(fileData)
      if(readFileFnResult instanceof Promise) fileData = await readFileFnResult
      else fileData = readFileFnResult

      const loadFnResult = this._config.loadFn(fileData)
      if(loadFnResult instanceof Promise) fileData = await loadFnResult
      else fileData = loadFnResult

      return this._setData(fileData, true)
    } catch (e) {
      throw e
    }
  }

  async _writeFile(pathString, encoding, flag, mode) {
    if(this.empty()) return false
    try {
      let fileData = this.data

      const saveFnResult = this._config.saveFn(fileData)
      if(saveFnResult instanceof Promise) fileData = await saveFnResult
      else fileData = saveFnResult

      const writeFileFnResult = this._config.writeFileFn(fileData)
      if(writeFileFnResult instanceof Promise) fileData = await writeFileFnResult
      else fileData = writeFileFnResult

      return await fileUtils.writeFile(pathString, fileData, encoding, flag, mode)
    } catch (e) {
      throw e
    }
  }

  _parseOptions(options) {

    if (!options.filePath) {
      throw new FileButlerError(`Missing 'filePath' option.`)
    }

    if (options.defaultValue === undefined) {
      throw new FileButlerError(`Missing 'defaultValue' option.`)
    }

    options.fileEncoding = (!options.fileEncoding ? options.fileEncoding : 'utf8')
    options.fileReadFlag = (!options.fileReadFlag ? options.fileReadFlag : 'r')
    options.fileWriteFlag = (!options.fileWriteFlag ? options.fileWriteFlag : 'w')
    options.fileMode = (!options.fileMode ? options.fileMode : 0o666)

    if (!fileUtils.isAbsolutePath(options.filePath)) {
      throw new FileButlerError(`'filePath' option must be an absolute path: ${options.filePath} .`)
    }

    this._config.filePath = options.filePath

    if (options.cloneFrom) {
      if (!fileUtils.isAbsolutePath(options.cloneFrom)) {
        throw new FileButlerError(`'cloneFrom' option must be an absolute path: ${options.cloneFrom} .`)
      }
      if (!fileUtils.fileExistsSync(options.cloneFrom)) {
        throw new FileButlerError(`Path specified in 'cloneFrom' option does not exist: ${options.cloneFrom} .`)
      }
    }
    this._config.cloneFrom = options.cloneFrom

    if (options.backupTo && !fileUtils.isAbsolutePath(options.backupTo)) {
      throw new FileButlerError(`'backupTo' option must be an absolute path: ${options.backupTo} .`)
    }
    this._config.backupTo = options.backupTo

    if (!_.isNil(options.loadFn)) {
      if(!_.isFunction(options.loadFn)) {
        throw new FileButlerError(`'loadFn' option must be a function.`)
      }
      this._config.loadFn = options.loadFn
    }

    if (!_.isNil(options.saveFn)) {
      if(!_.isFunction(options.saveFn)) {
        throw new FileButlerError(`'saveFn' option must be a function.`)
      }
      this._config.saveFn = options.saveFn
    }

    if(!_.isFunction(options.readFileFn)) {
      throw new FileButlerError(`'readFileFn' option must be a function.`)
    }
    this._config.readFileFn = options.readFileFn

    if(!_.isFunction(options.writeFileFn)) {
      throw new FileButlerError(`'writeFileFn' option must be a function.`)
    }
    this._config.writeFn = options.writeFileFn

    if(!_.isFunction(options.validityCheck)) {
      throw new FileButlerError(`'validityCheck' option must be a function.`)
    }
    this._config.validityCheck = options.validityCheck
  }

  async _cloneFile() {
    if(!this._config.cloneFrom) return
    try {
      if(await fileUtils.fileExists(this._config.filePath)) return
      return await fileUtils.copyFile(this._config.cloneFrom, this._config.filePath)
    } catch(e) {
      throw e
    }
  }

  async _backupFile() {
    if(!this._config.backupTo) return
    try {
      if((await fileUtils.fileExists(this._config.filePath)) !== true) return
      return await fileUtils.copyFile(this._config.filePath, this._config.backupTo)
    } catch(e) {
      throw e
    }
  }

  async load () {
    try {
      await this._cloneFile()
      return this._setData(await this._readFile(this._config.filePath))
    } catch(e) {
      throw e
    }
  }

  async save () {
    try {
      await this._backupFile()
      return await this._writeFile(this._config.filePath)
    } catch (e) {
      throw e
    }
  }
}
