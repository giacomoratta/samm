const _ = require('../core/utils/lodash.extended')
const fileUtils = require('../core/utils/file.utils')
const processUtils = require('../core/utils/process.utils')
const { DataFileHolder } = require('../libs/data-file-holder')
const ConfigField = require('./configField.class.js')

class config {
  constructor () {
    this.fields = {}
    this.flags = {}

    this.userdataPath = null
    this.userdataDirName = null
    this.configFilePath = null

    this.paths = {}
    this.cfgPaths = {}

    this.mixedCache = {}
    this.readonlyData = {}
  }

  _sanitize () {
    // TODO: update config.json with new fields with default values
  }

  init () {
    const _self = this

    DataFileHolder.setHolder({
      label: 'config_file',
      filePath: this.configFilePath,
      fileType: 'json',
      dataType: 'object',
      preLoad: true,
      logErrorsFn: console.warn,
      loadFn: (fileData) => {
        if (!_.isObject(fileData)) return { emptydata: true }
        _self.getConfigParams().forEach((k) => {
          if (_.isNil(fileData[k])) {
            console.warn('missing parameter from loaded configuration:', k, typeof fileData[k])
            return null
          }
          if (_.isNil(_self.set(k, fileData[k]))) {
            console.warn('wrong value for parameter', k, ' from loaded configuration:', fileData[k])
            processUtils.EXIT()
          }
        })
        _self.flagsStatusFromJSON(fileData.flagsStatus)
        return fileData
      },
      saveFn: () => {
        // do not save after load - it's not needed and there is a possible config file cancellation after some unexpected errors
        const fileData = {}
        _self.getConfigParams().forEach((k) => {
          fileData[k] = _self.get(k, true /* original value */)
        })
        fileData.flagsStatus = _self.flagsStatusToJSON()
        return fileData
      }
    })

    // Open config.json
    if (!DataFileHolder.get('config_file') || DataFileHolder.get('config_file').emptydata === true) {
      // generate the first config.json file
      if (this.save('config_file') === null) {
        processUtils.EXIT('Cannot create or read the configuration file ' + this.configFilePath)
      }
    }
  }

  exists (fieldName) {
    return _.isObject(this.fields[fieldName])
  }

  save () {
    return DataFileHolder.save('config_file')
  }

  path (label) {
    return this.paths[label]
  }

  cfgPath (label) {
    return this.cfgPaths[label]
  }

  _setCfgPaths (fieldName) {
    let rawPath = this.fields[fieldName].get()
    this.cfgPaths[fieldName] = null
    if (!_.isString(rawPath) || rawPath.length < 2) {
      console.warn('_setCfgPaths:', 'not a valid string for path for' + fieldName, '=', rawPath)
      return false
    }
    if (this.fields[fieldName].dataType.isAbsPath === true) {
      if (!fileUtils.isAbsolutePath(rawPath)) {
        console.warn('_setCfgPaths:', 'not a valid absolute path for' + fieldName, rawPath)
        return false
      }
    } else if (this.fields[fieldName].dataType.isRelPath === true) {
      if (!fileUtils.isRelativePath(rawPath)) {
        console.warn('_setCfgPaths:', 'not a valid relative path for' + fieldName, rawPath)
        return false
      }
      rawPath = fileUtils.setAsAbsPath(rawPath + fileUtils.pathSeparator, this.fields[fieldName].dataType.isRelFilePath)
    }
    this.cfgPaths[fieldName] = rawPath
    return true
  }

  addField (fieldName, fieldCfg) {
    fieldCfg.fieldname = fieldName
    fieldCfg.printErrorFn = console.error

    this.fields[fieldName] = new ConfigField(fieldCfg)

    if (this.fields[fieldName].dataType.isPath === true) {
      this._setCfgPaths(fieldName)
    }
    return true
  }

  get (fieldName, _origvalue) {
    if (!this.fields[fieldName]) return
    if (this.fields[fieldName].dataType.isPath === true && _origvalue !== true) {
      return this.cfgPath(fieldName)
    }
    return this.fields[fieldName].get()
  }

  setFromCli (fieldName, values, parseString) {
    if (!this.fields[fieldName]) return
    let setOutcome = true
    if (this.fields[fieldName].dataType.isArray === true) {
      const inElements = []; const outElements = []
      values.forEach((v) => {
        v = _.trim(v)
        if (v.startsWith('!')) outElements.push(v.substring(1))
        else inElements.push(v)
      })
      if (inElements.length > 0) setOutcome = setOutcome && this._set(fieldName, inElements, 'i', parseString /* parse */)
      if (outElements.length > 0) setOutcome = setOutcome && this._set(fieldName, outElements, 'd', parseString /* parse */)
    } else if (this.fields[fieldName].dataType.isObject === true) {
      if (!_.isString(values[1]) || (_.trim(values[1])).length < 1) values[1] = null
      setOutcome = setOutcome && this._set(fieldName, values[0], values[1], parseString /* parse */)
    } else {
      setOutcome = setOutcome && this._set(fieldName, values[0], null, parseString /* parse */)
    }
    return setOutcome
  }

  set (fieldName, value, addt) {
    if (!this.fields[fieldName]) return false
    return this._set(fieldName, value, addt, false /* parse */)
  }

  _set (fieldName, value, addt, parse) {
    const _self = this
    const setOutcome = this.fields[fieldName].set(value, addt, parse)
    if (setOutcome === true) {
      if (this.fields[fieldName].dataType.isPath === true) {
        this._setCfgPaths(fieldName)
      }

      if (!this.fields[fieldName].flagsOnChange()) return true
      this.fields[fieldName].flagsOnChange().forEach((v) => {
        _self.setFlag(v)
      })
    }
    return setOutcome
  }

  fieldFn (fieldName, fnName, options, addt) {
    if (!this.fields[fieldName]) return false
    if (!this.fields[fieldName].customFn(fnName)) return false
    options = _.merge({
      set: false,
      error: false,
      data: {}
    }, options)
    const newFieldValue = this.fields[fieldName].customFn(fnName)(this.get(fieldName), options.data)
    if (options.set === true) {
      if (this.set(fieldName, newFieldValue, addt) !== true) options.error = true
    }
    return newFieldValue
  }

  setFlag (label) {
    this.flags[label].status = true
  }

  unsetFlag (label) {
    this.flags[label].status = false
  }

  _flagsStatusToJSON () {
    const keys = Object.keys(this.flags)
    const flagsobj = {}
    keys.forEach((v) => {
      flagsobj[v] = this.flags[v].status
    })
    return flagsobj
  }

  _flagsStatusFromJSON (flagsStatus) {
    const keys = Object.keys(flagsStatus)
    keys.forEach((v) => {
      this.flags[v].status = flagsStatus[v]
    })
  }

  setSharedDirectory (name) {
    this._shareddata_path = fileUtils.setAsAbsPath('../' + name, false /* isFile */)
    if (!fileUtils.ensureDirSync(this._shareddata_path)) {
      console.warn('cannot ensure the common data directory or is not a valid path', this._shareddata_path)
      processUtils.EXIT()
    }
  }

  addSharedFile (label, relPath) {
    this.paths[label] = fileUtils.setAsAbsPath(relPath, true /* isFile */, this._shareddata_path + fileUtils.pathSeparator)
    if (!fileUtils.isAbsoluteParentDirSync(this.paths[label], true /* checkExists */)) {
      console.warn('the parent directory does not exist or is not a valid path', this.paths[label])
      processUtils.EXIT()
    }
  }

  addSharedDirectory (label, relPath) {
    this.paths[label] = fileUtils.setAsAbsPath(relPath, false /* isFile */, this._shareddata_path + fileUtils.pathSeparator)
    if (!fileUtils.ensureDirSync(this.paths[label])) {
      console.warn('cannot ensure the user directory or is not a valid path', this.paths[label])
      processUtils.EXIT()
    }
  }

  setUserdataDirectory (name) {
    this.userdataPath = fileUtils.setAsAbsPath(name, false /* isFile */)
    if (!fileUtils.ensureDirSync(this.userdataPath)) {
      console.warn('cannot ensure the user data directory or is not a valid path', this.userdataPath)
      processUtils.EXIT()
    }
    this.userdataDirName = fileUtils.pathBasename(this.userdataPath)
  }

  setConfigFile (name) {
    this.configFilePath = fileUtils.setAsAbsPath(this.userdataDirName + fileUtils.pathSeparator + name, true /* isFile */)
    if (!fileUtils.isAbsoluteParentDirSync(this.configFilePath, true /* checkExists */)) {
      console.warn('the parent directory of config file does not exist or is not a valid path', this.configFilePath)
      processUtils.EXIT()
    }
  }

  addUserDirectory (label, relPath) {
    this.paths[label] = fileUtils.setAsAbsPath(this.userdataDirName + fileUtils.pathSeparator + relPath, false /* isFile */)
    if (!fileUtils.ensureDirSync(this.paths[label])) {
      console.warn('cannot ensure the user directory or is not a valid path', this.paths[label])
      processUtils.EXIT()
    }
  }

  addUserFile (label, relPath) {
    this.paths[label] = fileUtils.setAsAbsPath(this.userdataDirName + fileUtils.pathSeparator + relPath, true /* isFile */)
    if (!fileUtils.isAbsoluteParentDirSync(this.paths[label], true /* checkExists */)) {
      console.warn('the parent directory does not exist or is not a valid path', this.paths[label])
      processUtils.EXIT()
    }
  }

  addFlag (label, message, status) {
    if (!_.isBoolean(status)) status = false
    this.flags[label] = {
      status: status,
      message: message
    }
  }

  loadReadOnlyData (label, pathString) {
    this.readonlyData[label] = fileUtils.readJsonFileSync(pathString)
  }

  readOnlyData (label) {
    return this.readonlyData[label]
  }

  getConfigParams () {
    return Object.keys(this.fields)
  }

  print () {
    console.log('\n', 'Current Configuration:')
    const params = this.getConfigParams()

    let _mlen1 = this.mixedCache.print_mlen1
    if (_.isNil(_mlen1)) {
      _mlen1 = 0
      params.forEach((v) => { if (_mlen1 < v.length) _mlen1 = v.length }); _mlen1 += 7
      this.mixedCache.print_mlen1 = _mlen1
    }

    for (let i = 0; i < params.length; i++) {
      let pvalue = this.get(params[i], true /* original value */)
      if (_.isNil(pvalue) || _.isNaN(pvalue)) pvalue = '<undefined>'
      if ((_.isString(pvalue) && pvalue.length === 0) || (_.isArray(pvalue) && pvalue.length === 0)) pvalue = '<empty>'
      if (_.isArray(pvalue)) pvalue = '[set] ' + pvalue.join(', ')
      console.log('  ', _.padEnd(params[i] + (params[i].length % 2 === 0 ? ' ' : ''), _mlen1, ' .'), pvalue)
    }
    console.log() // new line
  }

  printInternals () {
    const _self = this
    const pathsKeys = Object.keys(this.paths)
    const cfgPathsKeys = Object.keys(this.cfgPaths)
    const _flagsKeys = Object.keys(this.flags)

    const padEnd1 = 16
    let padEnd2 = this.mixedCache.print_padEnd2
    if (_.isNil(padEnd2)) {
      padEnd2 = 1
      pathsKeys.forEach((v) => { if (padEnd2 < v.length) padEnd2 = v.length })
      cfgPathsKeys.forEach((v) => { if (padEnd2 < v.length) padEnd2 = v.length })
      _flagsKeys.forEach((v) => { if (padEnd2 < v.length) padEnd2 = v.length })
      padEnd2 += 3
      this.mixedCache.print_padEnd2 = padEnd2
    }

    console.log('\n', 'Internal Configuration')
    console.log(_.padEnd('   (private)', padEnd1), _.padEnd('userdata path: ', padEnd2), _self.userdataPath)
    console.log(_.padEnd('   (private)', padEnd1), _.padEnd('config file path: ', padEnd2), _self.configFilePath)
    pathsKeys.forEach(function (v) {
      console.log(_.padEnd('   (path)', padEnd1), _.padEnd(v + ': ', padEnd2), (_.isNil(_self.paths[v]) ? '<undefined>' : _self.paths[v]))
    })
    cfgPathsKeys.forEach(function (v) {
      console.log(_.padEnd('   (cfg-path)', padEnd1), _.padEnd(v + ': ', padEnd2), (_.isNil(_self.cfgPaths[v]) ? '<undefined>' : _self.cfgPaths[v]))
    })
    _flagsKeys.forEach(function (v) {
      console.log(_.padEnd('   (flag)', padEnd1), _.padEnd(v + ': ', padEnd2), '[status:' + _self.flags[v].status + ']', _self.flags[v].message)
    })
    console.log() // new line
  }

  printMessages () {
    const k = Object.keys(this.flags)
    let str = ''
    for (let i = 0; i < k.length; i++) {
      if (this.flags[k[i]].status === true) {
        str += '[App Warning] ' + this.flags[k[i]].message + '\n'
      }
    }
    if (str.length === 0) return
    console.log('\n')
    console.log(str)
  }
}

module.exports = config
