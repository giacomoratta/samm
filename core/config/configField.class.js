const _ = require('../libs/utils/lodash.extended')
const fileUtils = require('../libs/utils/file.utils')
const stringUtils = require('../libs/utils/string.utils')

const ENUMS = {
  dataType: {
    integer: 1,
    number: 2,
    boolean: 3,
    char: 4,
    string: 5,
    array: 6,
    object: 7,
    relDirPath: 8,
    relFilePath: 9,
    absDirPath: 10,
    absFilePath: 11
  },
  checks: {
    success: 21,
    wrongValue: 22,
    wrongObjectValue: 23,
    valueNotAllowed: 24,
    pathNotExists: 25,
    labelNeeded: 26,
    parseValueNotString: 27,
    parsingFailed: 28,
    parsingIncompleteEnd: 29,
    parsingDifferentDataField: 30
  }
}

class ConfigField {
  constructor (name, options) {
    if (!name) {
      throw new TypeError(`no field name ${name}; expected string`)
    }
    if (!options) {
      throw new TypeError(`no options; expected object`)
    }
    this.name = name
    this.options = null
    this.value = null

    const fieldOptions = {
      description: '',
      dataType: 'string',
      objectDatatype: 0,
      defaultValue: null,
      allowedValues: [],
      flagsOnChange: null,
      transformFn: {
        /* exampleFn:function(v,dt) v=current value, dt={} object for data - return undefined to avoid set */
      },

      printErrorFn: null,
      checkFn: null,
      checkObjectFn: null,
      checkPathExists: false, // only for path

      setSuccessFn: null,

      // dataTypeCode - integer, set privately
      // objectDatatypeCode  - integer, set privately
      // setFn: null,  - function, set privately

      ...options

    }

    if (!_.isFunction(fieldOptions.printErrorFn)) fieldOptions.printErrorFn = console.info

    if (!this._setDatatype(fieldOptions.dataType, fieldOptions.objectDatatype, fieldOptions)) return

    fieldOptions.checkObjectFn = this._setCheckFn(fieldOptions.checkObjectFn, fieldOptions.objectDatatypeCode, fieldOptions)
    fieldOptions.checkFn = this._setCheckFn(fieldOptions.checkFn, fieldOptions.dataTypeCode, fieldOptions, fieldOptions.checkObjectFn)

    this.dataType = this._setDataTypeCheck(fieldOptions.dataTypeCode)
    this.objectDatatype = this._setDataTypeCheck(fieldOptions.objectDatatypeCode)

    if (!fieldOptions.checkFn) return

    this.options = fieldOptions
    fieldOptions.setFn = this._setSetFn(fieldOptions.checkFn, fieldOptions.checkObjectFn, fieldOptions)

    if (!this.set(fieldOptions.defaultValue)) {
      console.warn('configField.constructor', 'invalid default value', fieldOptions.defaultValue)
      this.value = null
      this.options = null
    }
  }

  _setDataTypeCheck (dataTypeCode) {
    return {
      isInteger: (dataTypeCode === ENUMS.dataType.integer),
      isNumber: (dataTypeCode === ENUMS.dataType.number),
      isBoolean: (dataTypeCode === ENUMS.dataType.boolean),
      isChar: (dataTypeCode === ENUMS.dataType.char),
      isString: (dataTypeCode === ENUMS.dataType.string),
      isArray: (dataTypeCode === ENUMS.dataType.array),
      isObject: (dataTypeCode === ENUMS.dataType.object),
      isRelDirPath: (dataTypeCode === ENUMS.dataType.relDirPath),
      isRelFilePath: (dataTypeCode === ENUMS.dataType.relFilePath),
      isAbsDirPath: (dataTypeCode === ENUMS.dataType.absDirPath),
      isAbsFilePath: (dataTypeCode === ENUMS.dataType.absFilePath),
      isRelPath: ((dataTypeCode === ENUMS.dataType.relDirPath) || (dataTypeCode === ENUMS.dataType.relFilePath)),
      isAbsPath: ((dataTypeCode === ENUMS.dataType.absDirPath) || (dataTypeCode === ENUMS.dataType.absFilePath)),
      isPath: ((dataTypeCode === ENUMS.dataType.absDirPath) || (dataTypeCode === ENUMS.dataType.absFilePath) ||
                        (dataTypeCode === ENUMS.dataType.relDirPath) || (dataTypeCode === ENUMS.dataType.relFilePath))
    }
  }

  error () {
    return (this.options === null || this.value === null)
  }

  get () {
    return this.value
  }

  set (v, addt, parse) {
    if (parse === true) {
      const parsedValue = this._parseValue(v)
      if (_.isNil(parsedValue)) return false
      v = parsedValue
    }
    const vObj = this.options.setFn(v, addt, this.value, this.options.allowedValues)
    if (_.isNil(vObj.v) || vObj.check !== ENUMS.checks.success) {
      this._printError(v, vObj.check)
      return false
    }
    this.value = vObj.v
    if (this.options.setSuccessFn) this.options.setSuccessFn()
    return true
  }

  fnSet () {
    return this.options.fnSet
  }

  transformFn (fnName) {
    return this.options.transformFn[fnName]
  }

  _parseValue (strvalue) {
    if (_.isArray(strvalue)) {
      if (this.dataType.isArray === true) {
        const newarray = []
        strvalue.forEach((v) => {
          const outcomeValue = this._parseSingleValue(v, this.options.objectDatatypeCode)
          if (!_.isNil(outcomeValue)) {
            newarray.push(outcomeValue)
          }
        })
        if (strvalue.length !== newarray.length) {
          this._printError(strvalue, ENUMS.checks.parsingIncompleteEnd)
          return null
        }
        return newarray
      }
      this._printError(strvalue, ENUMS.checks.parsingDifferentDataField)
      return null
    }

    if (this.dataType.isObject === true || this.dataType.isArray === true) {
      // parse internal data type for complex field
      return this._parseSingleValue(strvalue, this.options.objectDatatypeCode)
    }

    // parse simple data for simple field
    return this._parseSingleValue(strvalue, this.options.dataTypeCode)
  }

  _parseSingleValue (strvalue, dataTypeCode) {
    if (!_.isString(strvalue)) {
      this._printError(strvalue, ENUMS.checks.parseValueNotString)
      return null
    }
    let outcome = null

    if (dataTypeCode === ENUMS.dataType.integer) {
      outcome = stringUtils.strToInteger(strvalue)
    } else if (dataTypeCode === ENUMS.dataType.number) {
      outcome = stringUtils.strToFloat(strvalue)
    } else if (dataTypeCode === ENUMS.dataType.boolean) {
      outcome = stringUtils.strToBoolean(strvalue)
    } else {
      outcome = strvalue
    }
    if (_.isNil(outcome)) {
      this._printError(strvalue, ENUMS.checks.parsingFailed)
    }
    return outcome
  }

  allowedValues () {
    if (!_.isArray(this.options.allowedValues) || this.options.allowedValues.length < 1) return null
    return this.options.allowedValues
  }

  flagsOnChange () {
    if (!_.isArray(this.options.flagsOnChange) || this.options.flagsOnChange.length < 1) return null
    return this.options.flagsOnChange
  }

  _setDatatype (dataType, objectDatatype, fieldOptions) {
    if (!ENUMS.dataType[dataType]) {
      console.warn('_setDatatype: no valid dataType', dataType)
      return null
    }
    let objectDatatypeCode = null
    const dataTypeCode = ENUMS.dataType[dataType]
    if (dataTypeCode === ENUMS.dataType.array) {
      if (!ENUMS.dataType[objectDatatype]) {
        console.warn('_setDatatype: no valid objectDatatype', objectDatatype)
        return null
      }
      objectDatatypeCode = ENUMS.dataType[objectDatatype]
      if (objectDatatypeCode === ENUMS.dataType.array) {
        console.warn('_setDatatype: objectDatatype cannot be array!')
        return null
      }
    }
    if (fieldOptions) {
      fieldOptions.dataType = dataType
      fieldOptions.objectDatatype = objectDatatype
      fieldOptions.dataTypeCode = dataTypeCode
      fieldOptions.objectDatatypeCode = objectDatatypeCode
      return true
    }
    return {
      dataType: dataType,
      objectDatatype: objectDatatype,
      dataTypeCode: dataTypeCode,
      objectDatatypeCode: objectDatatypeCode
    }
  }

  _setCheckFn (checkFn, dataTypeCode, fieldOptions, _checkObjectFn) {
    if (!dataTypeCode) return null
    if (!_.isFunction(checkFn)) {
      switch (dataTypeCode) {
        case ENUMS.dataType.integer:
          checkFn = function (v) { return (_.isInteger(v) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
          break
        case ENUMS.dataType.number:
          checkFn = function (v) { return (_.isNumber(v) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
          break
        case ENUMS.dataType.boolean:
          checkFn = function (v) { return (_.isBoolean(v) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
          break
        case ENUMS.dataType.char:
          checkFn = function (v) { return ((_.isString(v) && v.length <= 1) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
          break
        case ENUMS.dataType.string:
          checkFn = function (v) { return (_.isString(v) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
          break
        case ENUMS.dataType.array:
          if (!_.isFunction(_checkObjectFn)) {
            return null
          }
          checkFn = function (v) {
            if (!_.isArray(v)) return ENUMS.checks.wrongValue
            for (let i = 0; i < v.length; i++) {
              if (_checkObjectFn(v[i]) === ENUMS.checks.wrongValue) return ENUMS.checks.wrongObjectValue
            }
            return ENUMS.checks.success
          }
          break
        case ENUMS.dataType.object:
          if (!_.isFunction(_checkObjectFn)) {
            return null
          }
          checkFn = function (v) {
            if (!_.isObject(v)) return ENUMS.checks.wrongValue
            for (let i = 0; i < v.length; i++) {
              if (_checkObjectFn(v[i]) === ENUMS.checks.wrongValue) return ENUMS.checks.wrongObjectValue
            }
            return ENUMS.checks.success
          }
          break
        case ENUMS.dataType.relDirPath:
          if (!fieldOptions || !fieldOptions.checkPathExists) {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isRelativePath(v) !== true) return ENUMS.checks.wrongValue
              return ENUMS.checks.success
            }
          } else {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isRelativePath(v) !== true) return ENUMS.checks.wrongValue
              if (fileUtils.directoryExistsSync(v) !== true) return ENUMS.checks.pathNotExists
              return ENUMS.checks.success
            }
          }
          break
        case ENUMS.dataType.relFilePath:
          if (!fieldOptions || !fieldOptions.checkPathExists) {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isRelativePath(v) !== true) return ENUMS.checks.wrongValue
              return ENUMS.checks.success
            }
          } else {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isRelativePath(v) !== true) return ENUMS.checks.wrongValue
              if (fileUtils.directoryExistsSync(v) !== true) return ENUMS.checks.pathNotExists
              return ENUMS.checks.success
            }
          }
          break
        case ENUMS.dataType.absDirPath:
          if (!fieldOptions || !fieldOptions.checkPathExists) {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isAbsolutePath(v) !== true) return ENUMS.checks.wrongValue
              return ENUMS.checks.success
            }
          } else {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isAbsolutePath(v) !== true) return ENUMS.checks.wrongValue
              if (fileUtils.directoryExistsSync(v) !== true) return ENUMS.checks.pathNotExists
              return ENUMS.checks.success
            }
          }
          break
        case ENUMS.dataType.absFilePath:
          if (!fieldOptions || !fieldOptions.checkPathExists) {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isAbsolutePath(v) !== true) return ENUMS.checks.wrongValue
              return ENUMS.checks.success
            }
          } else {
            checkFn = function (v) {
              if (_.isString(v) && v.length === 0) return ENUMS.checks.success
              if (fileUtils.isAbsolutePath(v) !== true) return ENUMS.checks.wrongValue
              if (fileUtils.directoryExistsSync(v) !== true) return ENUMS.checks.pathNotExists
              return ENUMS.checks.success
            }
          }
          break
        default:
                    // should never happens
      }
    }
    return checkFn
  }

  _getAllowedValuesFn (fieldOptions) {
    if (fieldOptions.dataTypeCode === ENUMS.dataType.array) {
      return function (v, awv) {
        if (!_.isArray(awv) || awv.length <= 0) return ENUMS.checks.success
        for (let i = 0; i < v.length; i++) {
          if (awv.indexOf(v) < 0) return ENUMS.checks.valueNotAllowed
        }
        return ENUMS.checks.success
      }
    }
    return function (v, awv) {
      if (!_.isArray(awv) || awv.length <= 0) return ENUMS.checks.success
      if (awv.indexOf(v) >= 0) return ENUMS.checks.success
      return ENUMS.checks.valueNotAllowed
    }
  }

  _setSetFn (checkFn, checkObjectFn, fieldOptions) {
    // addt = 'i', 'd', object key
    const allowedValuesFn = this._getAllowedValuesFn(fieldOptions)

    let setFn = function (v, addt, _ref, awv) {
      const vObj = { v: null, check: ENUMS.checks.success }

      vObj.check = checkFn(v)
      if (vObj.check !== ENUMS.checks.success) return vObj

      vObj.check = allowedValuesFn(v, awv)
      if (vObj.check !== ENUMS.checks.success) return vObj

      vObj.v = v
      return vObj
    }

    if (fieldOptions.dataTypeCode === ENUMS.dataType.array) {
      setFn = function (v, addt, _ref, awv) {
        const vObj = { v: null, check: ENUMS.checks.success }
        if (checkFn(v) === ENUMS.checks.success) {
          vObj.check = allowedValuesFn(v, awv)
          if (vObj.check !== ENUMS.checks.success) return vObj
          if (_.isNil(addt)) {
            vObj.v = v
            return vObj
          }
        } else {
          v = [v]
          vObj.check = allowedValuesFn(v, awv)
          if (vObj.check !== ENUMS.checks.success) return vObj
        }
        if (addt === 'i') {
          for (let i = 0; i < v.length; i++) {
            vObj.check = checkObjectFn(v[i])
            if (vObj.check !== ENUMS.checks.success) {
              if (vObj.check === ENUMS.checks.wrongValue) vObj.check = ENUMS.checks.wrongObjectValue
              return vObj
            }
            _ref.push(v[i])
          }
        } else if (addt === 'd') {
          for (let i = 0; i < v.length; i++) {
            const j = _ref.indexOf(v[i])
            if (j >= 0) _ref.splice(j, 1)
          }
        }
        vObj.v = _ref
        return vObj
      }
    } else if (fieldOptions.dataTypeCode === ENUMS.dataType.object) {
      setFn = function (v, addt, _ref, awv) {
        const vObj = { v: null, check: ENUMS.checks.success }
        if (checkFn(v) === ENUMS.checks.success) {
          vObj.v = v
          return vObj
        }
        if (!_.isString(addt)) {
          vObj.check = ENUMS.checks.labelNeeded
          return vObj
        }
        if (_.isNil(v)) {
          /* no value = delete key-value */
          delete _ref[addt]
          vObj.v = _ref
          return vObj
        }

        vObj.check = checkObjectFn(v)
        if (vObj.check !== ENUMS.checks.success) {
          if (vObj.check === ENUMS.checks.wrongValue) vObj.check = ENUMS.checks.wrongObjectValue
          return vObj
        }

        _ref[addt] = v
        vObj.v = _ref
        return vObj
      }
    }
    return setFn
  }

  _printError (fieldvalue, checkResult) {
    switch (checkResult) {
      case ENUMS.checks.wrongValue:
        this.options.printErrorFn(this.name + ': wrong value', fieldvalue)
        break
      case ENUMS.checks.wrongObjectValue:
        this.options.printErrorFn(this.name + ': wrong value for internal objects', fieldvalue)
        break
      case ENUMS.checks.valueNotAllowed:
        this.options.printErrorFn(this.name + ': value not allowed', fieldvalue)
        this.options.printErrorFn('Allowed values:', this.allowedValues())
        break
      case ENUMS.checks.pathNotExists:
        this.options.printErrorFn(this.name + ': path does not exist', fieldvalue)
        break
      case ENUMS.checks.labelNeeded:
        this.options.printErrorFn(this.name + ': label needed for object parameter', fieldvalue)
        break
      case ENUMS.checks.parseValueNotString:
        this.options.printErrorFn(this.name + ': cannot parse a non-string value', fieldvalue)
        break
      case ENUMS.checks.parsingFailed:
        this.options.printErrorFn(this.name + ': parsing failed', fieldvalue)
        break
      case ENUMS.checks.parsingIncompleteEnd:
        this.options.printErrorFn(this.name + ': incomplete parsing - errors occurred on some fields', fieldvalue)
        break
      case ENUMS.checks.parsingDifferentDataField:
        this.options.printErrorFn(this.name + ': parsing failed - data type does not match with field', fieldvalue)
        break
      default:
        this.options.printErrorFn(this.name + ': unknown error - ' + checkResult, 'value:', fieldvalue)
    }
  };
}

module.exports = {
  ConfigField,
  dataType: ENUMS.dataType
}
