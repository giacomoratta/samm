const _ = require('lodash')
const utils = require('./utils')

// todo: replace custom function with events (check event finished and get returned data)

class DataFileHolder {
  constructor () {
    this.fileConfig = { }
    this.fileData = { }

    // todo: external
    this.ENUMS = {
      fileType: {
        json: 'json',
        json_compact: 'json-compact',
        text: 'text'
      },
      dataType: {
        object: 'object',
        string: 'string',
        array: 'array'
      }
    }
  }

  _parseConfiguration (fileConfig) {
    if (!fileConfig) return null
    if (!fileConfig.label) return null
    // if(!options.filePath) return null; //???
    const defaultFileConfig = {
      label: null,
      filePath: null,
      fileType: 'json',
      dataType: 'object',

      /* Behaviour */
      cloneFrom: '', // if filePath does not exist, clone from this path
      backupTo: '', // after save, copy the file in filePath to this path
      preLoad: false, // calls loadFn after creating relationship
      autoLoad: false, // calls loadFn if it has no data
      preSet: false, // calls setFn after creating relationship
      autoSet: false, // calls setFn if it has no data
      autoSave: false, // calls saveFn after loadFn or setFn

      /* Custom functions */
      checkFn: null,
      initFn: null,
      getFn: null,
      setFn: null,
      loadFn: null,
      saveFn: null,
      printFn: null,
      logErrorsFn: function () {},

      /* Private functions */
      _checkDataType: null
    }

    const _fileConfig = _.merge(defaultFileConfig, fileConfig)
    _fileConfig.fileType = this._checkEnumValue('fileType', _fileConfig.fileType, this.ENUMS.fileType.json)
    _fileConfig.dataType = this._checkEnumValue('dataType', _fileConfig.dataType, this.ENUMS.dataType.object)
    _fileConfig._checkDataType = this._setcheckDataTypeFn(_fileConfig.dataType)
    return _fileConfig
  }

  fileExistsSync (label) {
    if (_.isNil(this.fileConfig[label]) || _.isNil(this.fileConfig[label].filePath)) return null
    return utils.fileExistsSync(this.fileConfig[label].filePath)
  }

  hasData (label) {
    return !_.isNil(this.fileData[label])
  }

  hasHolder (label) {
    return _.isObject(this.fileConfig[label])
  }

  setHolder (fileConfig) {
    fileConfig = this._parseConfiguration(fileConfig)
    if (!fileConfig) {
      fileConfig.logErrorsFn('dataFileHolder.setHolder > configuration not valid')
      return null
    }

    this.fileConfig[fileConfig.label] = fileConfig
    this.fileData[fileConfig.label] = null

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
    return this.fileConfig[label]
  }

  check (label, args) {
    const fileConfig = this.fileConfig[label]
    if (!fileConfig || !fileConfig.filePath) return null

    if (!this.hasData(label)) return false
    if (fileConfig.checkFn) {
      try {
        return fileConfig.checkFn(this.fileData[label], fileConfig, args)
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('dataFileHolder.check > checkFn callback failed')
        return null
      }
    }
    return this.hasData(label)
  }

  init (label, args) {
    const fileConfig = this.fileConfig[label]
    if (fileConfig.initFn) {
      try {
        this.fileData[label] = fileConfig.initFn(this.fileData[label], fileConfig, args)
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('dataFileHolder.init > initFn callback failed')
        return null
      }
    }
    return this.hasData(label)
  }

  load (label, args) {
    const fileConfig = this.fileConfig[label]
    if (!fileConfig || !fileConfig.filePath) return null

    let filedata = this._loadFileData(fileConfig)
    if (filedata === false || filedata === null) {
      fileConfig.logErrorsFn('dataFileHolder.load [' + label + '] > the file does not exist:', fileConfig.filePath)
      // return false;
      filedata = null
    }

    if (fileConfig.loadFn) {
      try {
        const data = fileConfig.loadFn(filedata, fileConfig, args)
        if (!fileConfig._checkDataType(data)) {
          fileConfig.logErrorsFn('dataFileHolder.load [' + label + '] > loaded data type is not ' + fileConfig.dataType)
          return null
        }
        this.fileData[label] = data
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('dataFileHolder.load [' + label + '] > loadFn callback failed!')
        return null
      }
    } else {
      if (!fileConfig._checkDataType(filedata)) {
        fileConfig.logErrorsFn('dataFileHolder.load [' + label + '] > loaded data type is not ' + fileConfig.dataType)
        return null
      }
      this.fileData[label] = filedata
    }

    if (fileConfig.autoSave === true) {
      this.save(label, args)
    }
    return this.fileData[label]
  }

  save (label, args) {
    const fileConfig = this.fileConfig[label]
    if (!fileConfig || !fileConfig.filePath || !this.fileData[label]) return null
    let filedata = null

    if (fileConfig.saveFn) {
      try {
        filedata = fileConfig.saveFn(this.fileData[label], fileConfig, args)
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('dataFileHolder.save > saveFn callback failed!')
        return null
      }

      if (fileConfig.backupTo.length > 0) {
        if (utils.copyFileSync(fileConfig.filePath, fileConfig.backupTo).err !== null) {
          fileConfig.logErrorsFn('dataFileHolder.save > backup failed!')
        }
      }
    } else filedata = this.fileData[label]
    const saveoutcome = this._saveFileData(fileConfig, filedata)
    if (saveoutcome === null || saveoutcome === false) return null
    return saveoutcome
  }

  set (label, data, args) {
    const fileConfig = this.fileConfig[label]
    if (!fileConfig || !fileConfig.filePath) return null

    this.fileData[label] = null
    if (data) {
      if (!fileConfig._checkDataType(data)) {
        fileConfig.logErrorsFn('dataFileHolder.set > data type is not ' + fileConfig.dataType)
        return null
      }
      this.fileData[label] = data
    } else if (fileConfig.setFn) {
      try {
        data = fileConfig.setFn(fileConfig, args)
        if (!fileConfig._checkDataType(data)) {
          fileConfig.logErrorsFn('dataFileHolder.set > data type is not ' + fileConfig.dataType)
          return null
        }
        this.fileData[label] = data
      } catch (e) {
        fileConfig.logErrorsFn(e)
        fileConfig.logErrorsFn('dataFileHolder.set > setFn callback failed!')
        return null
      }
    }

    if (fileConfig.autoSave === true) {
      this.save(label, args)
    }
    return this.fileData[label]
  }

  get (label, args) {
    const fileConfig = this.fileConfig[label]; if (!fileConfig) return null
    let dataObj = this.fileData[label]
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
        fileConfig.logErrorsFn('dataFileHolder.get > getFn callback failed')
        return null
      }
    }
    return dataObj
  }

  print (label, args) {
    const fileConfig = this.fileConfig[label]; if (!fileConfig) return null
    const dataObj = this.get(label, args)
    if (fileConfig.printFn) {
      return fileConfig.printFn(dataObj, fileConfig, args)
    }
  }

  _checkEnumValue (label, value, defaultValue) {
    const _check = (_.indexOf(Object.values(this.ENUMS[label]), value) >= 0)
    if (_check === true) return value
    if (!_.isNil(defaultValue)) return defaultValue
    return null
  }

  _setcheckDataTypeFn (dataType) {
    if (this.ENUMS.dataType.array === dataType) {
      return _.isArray
    } else if (this.ENUMS.dataType.string === dataType) {
      return _.isString
    }
    return _.isObject
  }

  _loadFileData (fileConfig) {
    if (fileConfig.cloneFrom.length > 0 && !utils.fileExistsSync(fileConfig.filePath)) {
      const cpF = utils.copyFileSync(fileConfig.cloneFrom, fileConfig.filePath)
      if (cpF.err) fileConfig.logErrorsFn('dataFileHolder > Cloning of file failed', 'src: ' + fileConfig.cloneFrom, 'dst: ' + fileConfig.filePath)
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

module.exports = DataFileHolder
