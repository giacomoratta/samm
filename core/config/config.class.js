const _ = require('../libs/utils/lodash')
const fileUtils = require('../libs/utils/file.utils')
const processUtils = require('../libs/utils/process.utils')
const { DataFileHolder } = require('../libs/data-file-holder')
const ConfigField = require('./configField.class.js')

class config {
  constructor () {
    this._fields = {}
    this._flags = {}

    this._userdata_path = null
    this._userdata_dirname = null
    this._configfilePath = null

    this._paths = {}
    this._cfgPaths = {}

    this._mixed_cache = {}
    this._readonly_data = {}
  }

  _sanitize () {
    // TODO: update config.json with new fields with default values
  }

  init () {
    const _self = this

    DataFileHolder.setHolder({
      label: 'config_file',
      filePath: this._configfilePath,
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
        _self._flagsStatusFromJSON(fileData._flagsStatus)
        return fileData
      },
      saveFn: () => {
        // do not save after load - it's not needed and there is a possible config file cancellation after some unexpected errors
        const fileData = {}
        _self.getConfigParams().forEach((k) => {
          fileData[k] = _self.get(k, true /* original value */)
        })
        fileData._flagsStatus = _self._flagsStatusToJSON()
        return fileData
      }
    })

    // Open config.json
    if (!DataFileHolder.get('config_file') || DataFileHolder.get('config_file').emptydata === true) {
      // generate the first config.json file
      if (this.save('config_file') === null) {
        processUtils.EXIT('Cannot create or read the configuration file ' + this._configfilePath)
      }
    }
  }

  exists (fieldName) {
    return _.isObject(this._fields[fieldName])
  }

  save () {
    return DataFileHolder.save('config_file')
  }

  path (label) {
    return this._paths[label]
  }

  cfgPath (label) {
    return this._cfgPaths[label]
  }

  _setCfgPaths (fieldName) {
    let rawPath = this._fields[fieldName].get()
    this._cfgPaths[fieldName] = null
    if (!_.isString(rawPath) || rawPath.length < 2) {
      console.warn('_setCfgPaths:', 'not a valid string for path for' + fieldName, '=', rawPath)
      return false
    }
    if (this._fields[fieldName].dataType.isAbsPath === true) {
      if (!fileUtils.isAbsolutePath(rawPath)) {
        console.warn('_setCfgPaths:', 'not a valid absolute path for' + fieldName, rawPath)
        return false
      }
    } else if (this._fields[fieldName].dataType.isRelPath === true) {
      if (!fileUtils.isRelativePath(rawPath)) {
        console.warn('_setCfgPaths:', 'not a valid relative path for' + fieldName, rawPath)
        return false
      }
      rawPath = fileUtils.setAsAbsPath(rawPath + fileUtils.pathSeparator, this._fields[fieldName].dataType.isRelFilePath)
    }
    this._cfgPaths[fieldName] = rawPath
    return true
  }

  addField (fieldName, fieldCfg) {
    fieldCfg.fieldname = fieldName
    fieldCfg.printErrorFn = console.error

    this._fields[fieldName] = new ConfigField(fieldCfg)
    if (this._fields[fieldName].error()) {
      console.warn('ConfigManager.addField', fieldName, 'ERROR')
      return false
    }

    if (this._fields[fieldName].dataType.isPath === true) {
      this._setCfgPaths(fieldName)
    }
    return true
  }

  get (fieldName, _origvalue) {
    if (!this._fields[fieldName]) return
    if (this._fields[fieldName].dataType.isPath === true && _origvalue !== true) {
      return this.cfgPath(fieldName)
    }
    return this._fields[fieldName].get()
  }

  setFromCli (fieldName, values, parseString) {
    if (!this._fields[fieldName]) return
    let setOutcome = true
    if (this._fields[fieldName].dataType.isArray === true) {
      const inElements = []; const outElements = []
      values.forEach((v) => {
        v = _.trim(v)
        if (v.startsWith('!')) outElements.push(v.substring(1))
        else inElements.push(v)
      })
      if (inElements.length > 0) setOutcome = setOutcome && this._set(fieldName, inElements, 'i', parseString /* parse */)
      if (outElements.length > 0) setOutcome = setOutcome && this._set(fieldName, outElements, 'd', parseString /* parse */)
    } else if (this._fields[fieldName].dataType.isObject === true) {
      if (!_.isString(values[1]) || (_.trim(values[1])).length < 1) values[1] = null
      setOutcome = setOutcome && this._set(fieldName, values[0], values[1], parseString /* parse */)
    } else {
      setOutcome = setOutcome && this._set(fieldName, values[0], null, parseString /* parse */)
    }
    return setOutcome
  }

  set (fieldName, value, addt) {
    if (!this._fields[fieldName]) return false
    return this._set(fieldName, value, addt, false /* parse */)
  }

  _set (fieldName, value, addt, parse) {
    const _self = this
    const setOutcome = this._fields[fieldName].set(value, addt, parse)
    if (setOutcome === true) {
      if (this._fields[fieldName].dataType.isPath === true) {
        this._setCfgPaths(fieldName)
      }

      if (!this._fields[fieldName].flagsOnChange()) return true
      this._fields[fieldName].flagsOnChange().forEach((v) => {
        _self.setFlag(v)
      })
    }
    return setOutcome
  }

  fieldFn (fieldName, fnName, options, addt) {
    if (!this._fields[fieldName]) return false
    if (!this._fields[fieldName].customFn(fnName)) return false
    options = _.merge({
      set: false,
      error: false,
      data: {}
    }, options)
    const newFieldValue = this._fields[fieldName].customFn(fnName)(this.get(fieldName), options.data)
    if (options.set === true) {
      if (this.set(fieldName, newFieldValue, addt) !== true) options.error = true
    }
    return newFieldValue
  }

  setFlag (label) {
    this._flags[label].status = true
  }

  unsetFlag (label) {
    this._flags[label].status = false
  }

  _flagsStatusToJSON () {
    const keys = Object.keys(this._flags)
    const flagsobj = {}
    keys.forEach((v) => {
      flagsobj[v] = this._flags[v].status
    })
    return flagsobj
  }

  _flagsStatusFromJSON (flagsStatus) {
    const keys = Object.keys(flagsStatus)
    keys.forEach((v) => {
      this._flags[v].status = flagsStatus[v]
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
    this._paths[label] = fileUtils.setAsAbsPath(relPath, true /* isFile */, this._shareddata_path + fileUtils.pathSeparator)
    if (!fileUtils.isAbsoluteParentDirSync(this._paths[label], true /* checkExists */)) {
      console.warn('the parent directory does not exist or is not a valid path', this._paths[label])
      processUtils.EXIT()
    }
  }

  addSharedDirectory (label, relPath) {
    this._paths[label] = fileUtils.setAsAbsPath(relPath, false /* isFile */, this._shareddata_path + fileUtils.pathSeparator)
    if (!fileUtils.ensureDirSync(this._paths[label])) {
      console.warn('cannot ensure the user directory or is not a valid path', this._paths[label])
      processUtils.EXIT()
    }
  }

  setUserdataDirectory (name) {
    this._userdata_path = fileUtils.setAsAbsPath(name, false /* isFile */)
    if (!fileUtils.ensureDirSync(this._userdata_path)) {
      console.warn('cannot ensure the user data directory or is not a valid path', this._userdata_path)
      processUtils.EXIT()
    }
    this._userdata_dirname = fileUtils.pathBasename(this._userdata_path)
  }

  setConfigFile (name) {
    this._configfilePath = fileUtils.setAsAbsPath(this._userdata_dirname + fileUtils.pathSeparator + name, true /* isFile */)
    if (!fileUtils.isAbsoluteParentDirSync(this._configfilePath, true /* checkExists */)) {
      console.warn('the parent directory of config file does not exist or is not a valid path', this._configfilePath)
      processUtils.EXIT()
    }
  }

  addUserDirectory (label, relPath) {
    this._paths[label] = fileUtils.setAsAbsPath(this._userdata_dirname + fileUtils.pathSeparator + relPath, false /* isFile */)
    if (!fileUtils.ensureDirSync(this._paths[label])) {
      console.warn('cannot ensure the user directory or is not a valid path', this._paths[label])
      processUtils.EXIT()
    }
  }

  addUserFile (label, relPath) {
    this._paths[label] = fileUtils.setAsAbsPath(this._userdata_dirname + fileUtils.pathSeparator + relPath, true /* isFile */)
    if (!fileUtils.isAbsoluteParentDirSync(this._paths[label], true /* checkExists */)) {
      console.warn('the parent directory does not exist or is not a valid path', this._paths[label])
      processUtils.EXIT()
    }
  }

  addFlag (label, message, status) {
    if (!_.isBoolean(status)) status = false
    this._flags[label] = {
      status: status,
      message: message
    }
  }

  loadReadOnlyData (label, pathString) {
    this._readonly_data[label] = fileUtils.readJsonFileSync(pathString)
  }

  readOnlyData (label) {
    return this._readonly_data[label]
  }

  getConfigParams () {
    return Object.keys(this._fields)
  }

  print () {
    console.log('\n', 'Current Configuration:')
    const params = this.getConfigParams()

    let _mlen1 = this._mixed_cache.print_mlen1
    if (_.isNil(_mlen1)) {
      _mlen1 = 0
      params.forEach((v) => { if (_mlen1 < v.length) _mlen1 = v.length }); _mlen1 += 7
      this._mixed_cache.print_mlen1 = _mlen1
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
    const _pathsKeys = Object.keys(this._paths)
    const _cfgPathsKeys = Object.keys(this._cfgPaths)
    const _flagsKeys = Object.keys(this._flags)

    const padEnd1 = 16
    let padEnd2 = this._mixed_cache.print_padEnd2
    if (_.isNil(padEnd2)) {
      padEnd2 = 1
      _pathsKeys.forEach((v) => { if (padEnd2 < v.length) padEnd2 = v.length })
      _cfgPathsKeys.forEach((v) => { if (padEnd2 < v.length) padEnd2 = v.length })
      _flagsKeys.forEach((v) => { if (padEnd2 < v.length) padEnd2 = v.length })
      padEnd2 += 3
      this._mixed_cache.print_padEnd2 = padEnd2
    }

    console.log('\n', 'Internal Configuration')
    console.log(_.padEnd('   (private)', padEnd1), _.padEnd('userdata path: ', padEnd2), _self._userdata_path)
    console.log(_.padEnd('   (private)', padEnd1), _.padEnd('config file path: ', padEnd2), _self._configfilePath)
    _pathsKeys.forEach(function (v) {
      console.log(_.padEnd('   (path)', padEnd1), _.padEnd(v + ': ', padEnd2), (_.isNil(_self._paths[v]) ? '<undefined>' : _self._paths[v]))
    })
    _cfgPathsKeys.forEach(function (v) {
      console.log(_.padEnd('   (cfg-path)', padEnd1), _.padEnd(v + ': ', padEnd2), (_.isNil(_self._cfgPaths[v]) ? '<undefined>' : _self._cfgPaths[v]))
    })
    _flagsKeys.forEach(function (v) {
      console.log(_.padEnd('   (flag)', padEnd1), _.padEnd(v + ': ', padEnd2), '[status:' + _self._flags[v].status + ']', _self._flags[v].message)
    })
    console.log() // new line
  }

  printMessages () {
    const k = Object.keys(this._flags)
    let str = ''
    for (let i = 0; i < k.length; i++) {
      if (this._flags[k[i]].status === true) {
        str += '[App Warning] ' + this._flags[k[i]].message + '\n'
      }
    }
    if (str.length === 0) return
    console.log('\n')
    console.log(str)
  }
}

module.exports = config
