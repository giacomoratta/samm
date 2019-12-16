const Events = require('events')
const _ = require('../libs/utils/lodash.extended')
const fileUtils = require('../libs/utils/file.utils')
const stringUtils = require('../libs/utils/string.utils')

const ENUMS = {
  dataType: {
    empty: 1,
    integer: 2,
    number: 3,
    boolean: 4,
    char: 5,
    string: 6,
    array: 7,
    object: 8,
    relDirPath: 11,
    relFilePath: 12,
    absDirPath: 13,
    absFilePath: 14
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
  },
  acceptedEvents: [
      'change'
  ]
}


const setDataTypes = (fieldOptions) => {
  if (!ENUMS.dataType[fieldOptions.dataType]) {
    throw new Error(`invalid dataType '${fieldOptions.dataType}' [field: '${fieldOptions.name}']`)
  }
  if (!ENUMS.dataType[fieldOptions.objectDatatype]) {
    throw new Error(`invalid objectDatatype '${fieldOptions.objectDatatype}' [field: '${fieldOptions.name}']`)
  }

  const dataTypeCode = ENUMS.dataType[fieldOptions.dataType]
  const objectDatatypeCode = ENUMS.dataType[fieldOptions.objectDatatype]

  if (objectDatatypeCode === ENUMS.dataType.array || objectDatatypeCode === ENUMS.dataType.object) {
    throw new Error(`objectDatatype cannot be '${fieldOptions.objectDatatype}' [field: '${fieldOptions.name}']`)
  }

  if (dataTypeCode === ENUMS.dataType.array || dataTypeCode === ENUMS.dataType.object) {
    if (objectDatatypeCode === ENUMS.dataType.empty) {
      throw new Error(`objectDatatype cannot be '${fieldOptions.objectDatatype}' as '${fieldOptions.dataType}' element [field: '${fieldOptions.name}']`)
    }
  }
  fieldOptions.dataTypeCode = dataTypeCode
  fieldOptions.objectDatatypeCode = objectDatatypeCode
}


const setCheckFn = (fieldOptions, dataTypeField) => {
  let checkFn = null
  switch (fieldOptions[dataTypeField]) {
    case ENUMS.dataType.empty:
      checkFn = function (value) { return (_.isNil(value) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
      break
    case ENUMS.dataType.integer:
      checkFn = function (value) { return (_.isInteger(value) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
      break
    case ENUMS.dataType.number:
      checkFn = function (value) { return (_.isNumber(value) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
      break
    case ENUMS.dataType.boolean:
      checkFn = function (value) { return (_.isBoolean(value) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
      break
    case ENUMS.dataType.char:
      checkFn = function (value) { return ((_.isString(value) && value.length <= 1) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
      break
    case ENUMS.dataType.string:
      checkFn = function (value) { return (_.isString(value) === true ? ENUMS.checks.success : ENUMS.checks.wrongValue) }
      break
    case ENUMS.dataType.array:
      if (!_.isFunction(fieldOptions.checkObjectFn)) {
        throw new Error(`no checkObjectFn for '${fieldOptions.objectDatatype}' [field: '${fieldOptions.name}']`)
      }
      checkFn = function (value) {
        if (!_.isArray(value)) return ENUMS.checks.wrongValue
        for (let i = 0; i < value.length; i++) {
          if (fieldOptions.checkObjectFn(value[i]) === ENUMS.checks.wrongValue) return ENUMS.checks.wrongObjectValue
        }
        return ENUMS.checks.success
      }
      break
    case ENUMS.dataType.object:
      if (!_.isFunction(fieldOptions.checkObjectFn)) {
        throw new Error(`no checkObjectFn for '${fieldOptions.objectDatatype}' [field: '${fieldOptions.name}']`)
      }
      checkFn = function (value) {
        if (!_.isObject(value)) return ENUMS.checks.wrongValue
        for (let i = 0; i < value.length; i++) {
          if (fieldOptions.checkObjectFn(value[i]) === ENUMS.checks.wrongValue) return ENUMS.checks.wrongObjectValue
        }
        return ENUMS.checks.success
      }
      break
    case ENUMS.dataType.relDirPath:
      if (!fieldOptions || !fieldOptions.checkPathExists) {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isRelativePath(value) !== true) return ENUMS.checks.wrongValue
          return ENUMS.checks.success
        }
      } else {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isRelativePath(value) !== true) return ENUMS.checks.wrongValue
          if (fileUtils.directoryExistsSync(value) !== true) return ENUMS.checks.pathNotExists
          return ENUMS.checks.success
        }
      }
      break
    case ENUMS.dataType.relFilePath:
      if (!fieldOptions || !fieldOptions.checkPathExists) {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isRelativePath(value) !== true) return ENUMS.checks.wrongValue
          return ENUMS.checks.success
        }
      } else {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isRelativePath(value) !== true) return ENUMS.checks.wrongValue
          if (fileUtils.fileExistsSync(value) !== true) return ENUMS.checks.pathNotExists
          return ENUMS.checks.success
        }
      }
      break
    case ENUMS.dataType.absDirPath:
      if (!fieldOptions || !fieldOptions.checkPathExists) {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isAbsolutePath(value) !== true) return ENUMS.checks.wrongValue
          return ENUMS.checks.success
        }
      } else {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isAbsolutePath(value) !== true) return ENUMS.checks.wrongValue
          if (fileUtils.directoryExistsSync(value) !== true) return ENUMS.checks.pathNotExists
          return ENUMS.checks.success
        }
      }
      break
    case ENUMS.dataType.absFilePath:
      if (!fieldOptions || !fieldOptions.checkPathExists) {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isAbsolutePath(value) !== true) return ENUMS.checks.wrongValue
          return ENUMS.checks.success
        }
      } else {
        checkFn = function (value) {
          if (_.isString(value) && value.length === 0) return ENUMS.checks.success
          if (fileUtils.isAbsolutePath(value) !== true) return ENUMS.checks.wrongValue
          if (fileUtils.fileExistsSync(value) !== true) return ENUMS.checks.pathNotExists
          return ENUMS.checks.success
        }
      }
      break
    default:
      // should never happens
  }
  if (!checkFn) {
    throw new Error(`no checkFn found for '${dataTypeField}' = ${fieldOptions[dataTypeField]} [field: '${fieldOptions.name}']`)
  }
  return checkFn
}


const setDataTypeCheck = (dataTypeCode) => {
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


const getAllowedValuesFn = (fieldOptions) => {
  if (fieldOptions.dataTypeCode === ENUMS.dataType.array) {
    return function (value, allowedValues) {
      if (!_.isArray(allowedValues) || allowedValues.length <= 0) return ENUMS.checks.success
      for (let i = 0; i < value.length; i++) {
        if (allowedValues.indexOf(value) < 0) return ENUMS.checks.valueNotAllowed
      }
      return ENUMS.checks.success
    }
  }
  return function (value, allowedValues) {
    if (!_.isArray(allowedValues) || allowedValues.length <= 0) return ENUMS.checks.success
    if (allowedValues.indexOf(value) >= 0) return ENUMS.checks.success
    return ENUMS.checks.valueNotAllowed
  }
}


const setSetFn = (fieldOptions) => {
  // additional = 'i', 'd', object key
  const allowedValuesFn = getAllowedValuesFn(fieldOptions)

  let setFn = function (value, additional, currentValue, allowedValues) {
    const setFnResult = { value: null, check: ENUMS.checks.success }

    setFnResult.check = fieldOptions.checkFn(value)
    if (setFnResult.check !== ENUMS.checks.success) return setFnResult

    setFnResult.check = allowedValuesFn(value, allowedValues)
    if (setFnResult.check !== ENUMS.checks.success) return setFnResult

    setFnResult.value = value
    return setFnResult
  }

  if (fieldOptions.dataTypeCode === ENUMS.dataType.array) {

    setFn = function (value, additional, currentValue, allowedValues) {
      const setFnResult = { value: null, check: ENUMS.checks.success }
      if (fieldOptions.checkFn(value) === ENUMS.checks.success) {
        setFnResult.check = allowedValuesFn(value, allowedValues)
        if (setFnResult.check !== ENUMS.checks.success) return setFnResult
        if (_.isNil(additional)) {
          setFnResult.value = value
          return setFnResult
        }
      } else {
        value = [value]
        setFnResult.check = allowedValuesFn(value, allowedValues)
        if (setFnResult.check !== ENUMS.checks.success) return setFnResult
      }
      if (additional === 'i') {
        for (let i = 0; i < value.length; i++) {
          setFnResult.check = fieldOptions.checkObjectFn(value[i])
          if (setFnResult.check !== ENUMS.checks.success) {
            if (setFnResult.check === ENUMS.checks.wrongValue) setFnResult.check = ENUMS.checks.wrongObjectValue
            return setFnResult
          }
          currentValue.push(value[i])
        }
      } else if (additional === 'd') {
        for (let i = 0; i < value.length; i++) {
          const j = currentValue.indexOf(value[i])
          if (j >= 0) currentValue.splice(j, 1)
        }
      }
      setFnResult.value = currentValue
      return setFnResult
    }

  } else if (fieldOptions.dataTypeCode === ENUMS.dataType.object) {

    setFn = function (value, additional, currentValue, allowedValues) {
      const setFnResult = { value: null, check: ENUMS.checks.success }
      if (fieldOptions.checkFn(value) === ENUMS.checks.success) {
        setFnResult.value = value
        return setFnResult
      }
      if (!_.isString(additional)) {
        setFnResult.check = ENUMS.checks.labelNeeded
        return setFnResult
      }
      if (_.isNil(value)) {
        /* no value = delete key-value */
        delete currentValue[additional]
        setFnResult.value = currentValue
        return setFnResult
      }

      setFnResult.check = fieldOptions.checkObjectFn(value)
      if (setFnResult.check !== ENUMS.checks.success) {
        if (setFnResult.check === ENUMS.checks.wrongValue) setFnResult.check = ENUMS.checks.wrongObjectValue
        return setFnResult
      }

      currentValue[additional] = value
      setFnResult.value = currentValue
      return setFnResult
    }
  }
  return setFn
}


class ConfigField {
  constructor (name, options) {
    if (!name) {
      throw new TypeError(`no field name '${name}'; expected string`)
    }
    if (!options) {
      throw new TypeError(`no options for field '${name}'; expected object`)
    }
    this.name = name
    this.options = null
    this.value = null
    this.eventEmitter = new Events()

    const fieldOptions = {
      name,
      description: '',
      dataType: 'string',
      objectDatatype: 'empty',
      defaultValue: null,
      allowedValues: [],
      // transformFn: {
      //   /* exampleFn:function(value,dt) v=current value, dt={} object for data - return undefined to avoid set */
      // },

      printErrorFn: console.info, // todo: remove
      checkFn: null,
      checkObjectFn: null,
      checkPathExists: false, // only for path

      // dataTypeCode - integer, set privately
      // objectDatatypeCode  - integer, set privately
      // setFn: null,  - function, set privately

      ...options
    }

    setDataTypes(fieldOptions)

    fieldOptions.checkObjectFn = setCheckFn(fieldOptions, 'objectDatatypeCode')
    fieldOptions.checkFn = setCheckFn(fieldOptions, 'dataTypeCode')

    this.dataType = setDataTypeCheck(fieldOptions.dataTypeCode)
    this.objectDatatype = setDataTypeCheck(fieldOptions.objectDatatypeCode)
    fieldOptions.setFn = setSetFn(fieldOptions)

    this.options = fieldOptions

    if (!this.set(fieldOptions.defaultValue)) {
      throw new Error(`invalid defaultValue '${fieldOptions.defaultValue}' as ${fieldOptions.dataType} [field: '${this.name}']`)
    }
  }

  get () {
    return this.value
  }

  // transform (fnName) {
  //   return this.options.transformFn[fnName]
  // }

  set (value, additional /*, parse*/) {
    // if (parse === true) {
    //   const parsedValue = this._parseValue(value)
    //   if (_.isNil(parsedValue)) return false
    //   value = parsedValue
    // }
    const setFnResult = this.options.setFn(value, additional, this.value, this.options.allowedValues)
    if (_.isNil(setFnResult.value) || setFnResult.check !== ENUMS.checks.success) {
      this._printError(value, setFnResult.check)
      return false
    }
    this.value = setFnResult.value
    this.eventEmitter.emit('change', { value: this.value })
    return true
  }

  // _parseValue (strvalue) {
  //   if (_.isArray(strvalue)) {
  //     if (this.dataType.isArray === true) {
  //       const newarray = []
  //       strvalue.forEach((value) => {
  //         const outcomeValue = this._parseSingleValue(value, this.options.objectDatatypeCode)
  //         if (!_.isNil(outcomeValue)) {
  //           newarray.push(outcomeValue)
  //         }
  //       })
  //       if (strvalue.length !== newarray.length) {
  //         this._printError(strvalue, ENUMS.checks.parsingIncompleteEnd)
  //         return null
  //       }
  //       return newarray
  //     }
  //     this._printError(strvalue, ENUMS.checks.parsingDifferentDataField)
  //     return null
  //   }
  //
  //   if (this.dataType.isObject === true || this.dataType.isArray === true) {
  //     // parse internal data type for complex field
  //     return this._parseSingleValue(strvalue, this.options.objectDatatypeCode)
  //   }
  //
  //   // parse simple data for simple field
  //   return this._parseSingleValue(strvalue, this.options.dataTypeCode)
  // }
  //
  // _parseSingleValue (strvalue, dataTypeCode) {
  //   if (!_.isString(strvalue)) {
  //     this._printError(strvalue, ENUMS.checks.parseValueNotString)
  //     return null
  //   }
  //   let outcome = null
  //
  //   if (dataTypeCode === ENUMS.dataType.integer) {
  //     outcome = stringUtils.strToInteger(strvalue)
  //   } else if (dataTypeCode === ENUMS.dataType.number) {
  //     outcome = stringUtils.strToFloat(strvalue)
  //   } else if (dataTypeCode === ENUMS.dataType.boolean) {
  //     outcome = stringUtils.strToBoolean(strvalue)
  //   } else {
  //     outcome = strvalue
  //   }
  //   if (_.isNil(outcome)) {
  //     this._printError(strvalue, ENUMS.checks.parsingFailed)
  //   }
  //   return outcome
  // }

  allowedValues () {
    if (!_.isArray(this.options.allowedValues) || this.options.allowedValues.length < 1) return []
    return this.options.allowedValues
  }

  on (eventName, cb) {
    if (!ENUMS.acceptedEvents.includes(eventName)) {
      throw new Error(`Invalid event '${eventName}' for configField ${this.name}`)
    }
    this.eventEmitter.on(eventName, cb)
  }

  _printError (fieldValue, checkResult) {
    switch (checkResult) {
      case ENUMS.checks.wrongValue:
        this.options.printErrorFn(this.name + ': wrong value', fieldValue)
        break
      case ENUMS.checks.wrongObjectValue:
        this.options.printErrorFn(this.name + ': wrong value for internal objects', fieldValue)
        break
      case ENUMS.checks.valueNotAllowed:
        this.options.printErrorFn(this.name + ': value not allowed', fieldValue)
        this.options.printErrorFn('Allowed values:', this.allowedValues())
        break
      case ENUMS.checks.pathNotExists:
        this.options.printErrorFn(this.name + ': path does not exist', fieldValue)
        break
      case ENUMS.checks.labelNeeded:
        this.options.printErrorFn(this.name + ': label needed for object parameter', fieldValue)
        break
      case ENUMS.checks.parseValueNotString:
        this.options.printErrorFn(this.name + ': cannot parse a non-string value', fieldValue)
        break
      case ENUMS.checks.parsingFailed:
        this.options.printErrorFn(this.name + ': parsing failed', fieldValue)
        break
      case ENUMS.checks.parsingIncompleteEnd:
        this.options.printErrorFn(this.name + ': incomplete parsing - errors occurred on some fields', fieldvalue)
        break
      case ENUMS.checks.parsingDifferentDataField:
        this.options.printErrorFn(this.name + ': parsing failed - data type does not match with field', fieldValue)
        break
      default:
        this.options.printErrorFn(this.name + ': unknown error - ' + checkResult, 'value:', fieldValue)
    }
  }
}

module.exports = {
  ConfigField,
  dataType: ENUMS.dataType
}
