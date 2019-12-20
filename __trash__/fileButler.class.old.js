const _ = require('lodash')
const { ENUMS, parseConfiguration } = require('../core/file-butler/fileButler.utils')

// todo: replace custom function with events (check event finished and get returned data)

class FileButler {
  constructor (config) {
    this.config = parseConfiguration(config)
    this.data = { }
  }

  fileExistsSync (label) {
    if (_.isNil(this.config[label]) || _.isNil(this.config[label].filePath)) return null
    return utils.fileExistsSync(this.config[label].filePath)
  }

  hasData (label) {
    return !_.isNil(this.data[label])
  }

  hasHolder (label) {
    return _.isObject(this.config[label])
  }

  setHolder (fileConfig) {
    fileConfig = this._parseConfiguration(fileConfig)
    if (!fileConfig) {
      fileConfig.logErrorsFn('fileButler.setHolder > configuration not valid')
      return null
    }

    this.config[fileConfig.label] = fileConfig
    this.data[fileConfig.label] = null

    let _outcomeLoadSet = null
    if (fileConfig.preLoad === true) {
      _outcomeLoadSet = this.load(fileConfig.label)
      if (!this.hasData(fileConfig.label)) this.init(fileConfig.label)
      return _outcomeLoadSet
    }
    if (fileConfig.preSet === true) {
      _outcomeLoadSet = this.set(fileConfig.label)
      if (!this.hasData(fileConfig.label)) this.init(fileConfig.label)
      return _outcomeLoadSet
    }

    this.init(fileConfig.label)
    return true
  }

  fileConfig (label) {
    return this.config[label]
  }

  check (label, args) {
    const fileConfig = this.config[label]
    if (!fileConfig || !fileConfig.filePath) return null

    if (!this.hasData(label)) return false
    if (fileConfig.checkFn) {
      try {
        return fileConfig.checkFn(this.data[label], fileConfig, args)
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('fileButler.check > checkFn callback failed')
        return null
      }
    }
    return this.hasData(label)
  }

  init (label, args) {
    const fileConfig = this.config[label]
    if (fileConfig.initFn) {
      try {
        this.data[label] = fileConfig.initFn(this.data[label], fileConfig, args)
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('fileButler.init > initFn callback failed')
        return null
      }
    }
    return this.hasData(label)
  }

  load (label, args) {
    const fileConfig = this.config[label]
    if (!fileConfig || !fileConfig.filePath) return null

    let filedata = this._loadFileData(fileConfig)
    if (filedata === false || filedata === null) {
      fileConfig.logErrorsFn('fileButler.load [' + label + '] > the file does not exist:', fileConfig.filePath)
      // return false;
      filedata = null
    }

    if (fileConfig.loadFn) {
      try {
        const data = fileConfig.loadFn(filedata, fileConfig, args)
        if (!fileConfig._checkDataType(data)) {
          fileConfig.logErrorsFn('fileButler.load [' + label + '] > loaded data type is not ' + fileConfig.dataType)
          return null
        }
        this.data[label] = data
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('fileButler.load [' + label + '] > loadFn callback failed!')
        return null
      }
    } else {
      if (!fileConfig._checkDataType(filedata)) {
        fileConfig.logErrorsFn('fileButler.load [' + label + '] > loaded data type is not ' + fileConfig.dataType)
        return null
      }
      this.data[label] = filedata
    }

    if (fileConfig.autoSave === true) {
      this.save(label, args)
    }
    return this.data[label]
  }

  save (label, args) {
    const fileConfig = this.config[label]
    if (!fileConfig || !fileConfig.filePath || !this.data[label]) return null
    let filedata = null

    if (fileConfig.saveFn) {
      try {
        filedata = fileConfig.saveFn(this.data[label], fileConfig, args)
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('fileButler.save > saveFn callback failed!')
        return null
      }

      if (fileConfig.backupTo.length > 0) {
        if (utils.copyFileSync(fileConfig.filePath, fileConfig.backupTo).err !== null) {
          fileConfig.logErrorsFn('fileButler.save > backup failed!')
        }
      }
    } else filedata = this.data[label]
    const saveoutcome = this._saveFileData(fileConfig, filedata)
    if (saveoutcome === null || saveoutcome === false) return null
    return saveoutcome
  }

  set (label, data, args) {
    const fileConfig = this.config[label]
    if (!fileConfig || !fileConfig.filePath) return null

    this.data[label] = null
    if (data) {
      if (!fileConfig._checkDataType(data)) {
        fileConfig.logErrorsFn('fileButler.set > data type is not ' + fileConfig.dataType)
        return null
      }
      this.data[label] = data
    } else if (fileConfig.setFn) {
      try {
        data = fileConfig.setFn(fileConfig, args)
        if (!fileConfig._checkDataType(data)) {
          fileConfig.logErrorsFn('fileButler.set > data type is not ' + fileConfig.dataType)
          return null
        }
        this.data[label] = data
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('fileButler.set > setFn callback failed!')
        return null
      }
    }

    if (fileConfig.autoSave === true) {
      this.save(label, args)
    }
    return this.data[label]
  }

  get (label, args) {
    const fileConfig = this.config[label]; if (!fileConfig) return null
    let dataObj = this.data[label]
    if (!dataObj) {
      if (fileConfig.autoLoad === true) {
        dataObj = this.load(fileConfig.label, args)
      } else if (fileConfig.autoSet === true) {
        dataObj = this.set(fileConfig.label, args)
      }
    }
    if (fileConfig.getFn) {
      try {
        return fileConfig.getFn(dataObj, fileConfig, args)
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('fileButler.get > getFn callback failed')
        return null
      }
    }
    return dataObj
  }

  print (label, args) {
    const fileConfig = this.config[label]; if (!fileConfig) return null
    const dataObj = this.get(label, args)
    if (fileConfig.printFn) {
      return fileConfig.printFn(dataObj, fileConfig, args)
    }
  }

  _loadFileData (fileConfig) {
    if (fileConfig.cloneFrom.length > 0 && !utils.fileExistsSync(fileConfig.filePath)) {
      const cpF = utils.copyFileSync(fileConfig.cloneFrom, fileConfig.filePath)
      if (cpF.err) fileConfig.logErrorsFn('fileButler > Cloning of file failed', 'src: ' + fileConfig.cloneFrom, 'dst: ' + fileConfig.filePath)
    }
    if (fileConfig.fileType === this.ENUMS.fileType.json || fileConfig.fileType === this.ENUMS.fileType.json_compact) {
      return utils.readJsonFileSync(fileConfig.filePath)
    } else if (fileConfig.fileType === this.ENUMS.fileType.text) {
      return utils.readTextFileSync(fileConfig.filePath)
    }
    return null
  }

  _saveFileData (fileConfig, content) {
    if (fileConfig.fileType === this.ENUMS.fileType.json) {
      return utils.writeJsonFileSync(fileConfig.filePath, content)
    } else if (fileConfig.fileType === this.ENUMS.fileType.json_compact) {
      return utils.writeJsonFileSync(fileConfig.filePath, content, false)
    } else if (fileConfig.fileType === this.ENUMS.fileType.text) {
      return utils.writeTextFileSync(fileConfig.filePath, content)
    }
    return null
  }
}

module.exports = FileButler
