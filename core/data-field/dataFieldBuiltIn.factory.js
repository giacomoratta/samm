/**
 * This is also an example on how a new DataFieldFactory should be created.
 * The project should have a DataFieldFactory exported as singleton, which must contain messages, defined fields, etc.
 * Before exporting it, the method init() must be called in order to instantiate the internal validator which will be
 * used by all the DataField(s) created in the project.
 *
 *  1) extends the a DataFieldFactory class
 *  2) declare messages
 *  3) define fields (with new validators or custom functions)
 *  4) export as singleton (when used in project)
 *
 */

const _ = require('lodash')
const path = require('path')
const { fileUtils } = require('../utils/file.utils')
const { DataFieldError } = require('./dataField.error')
const { DataFieldFactory } = require('./dataField.factory')

class DataFieldBuiltInFactory extends DataFieldFactory {
  constructor () {
    super()

    this.messages({
      invalidBasePath: 'The \'{field}\' field must have an absolute path as basePath. Actual: {actual}',
      dirNotExists: 'Directory \'{field}\' does not exists. Actual: {actual}',
      dirAlreadyExists: 'Directory \'{field}\' already exists. Actual: {actual}',
      fileNotExists: 'File \'{field}\' does not exists. Actual: {actual}',
      fileAlreadyExists: 'File \'{field}\' already exists. Actual: {actual}',
      notAbsDirPath: 'Directory \'{field}\' is not an absolute path. Actual: {actual}',
      notAbsFilePath: 'File \'{field}\' is not an absolute path. Actual: {actual}',
      notRelDirPath: 'Directory \'{field}\' is not a relative path. Actual: {actual}',
      notRelFilePath: 'File \'{field}\' is not a relative path. Actual: {actual}',
      dirNotCreated: 'Directory \'{field}\' has not been created. Actual: {actual}',
      fileNotCreated: 'File \'{field}\' has not been created. Actual: {actual}',
      dirNotDeleted: 'Directory \'{field}\' has not been deleted. Actual: {actual}',
      fileNotDeleted: 'File \'{field}\' has not been deleted. Actual: {actual}'
    })

    this._enrichArray()
    this._enrichObject()
    this._defineQueue()
    this._definePathFields()
  }

  _enrichArray () {
    this.define('array', function () {
      return {
        add: (field, value, index) => {
          const array = field.value
          if (index === undefined) array.push(value)
          else if (index === 0) array.unshift(value)
          else array.splice(Math.min(index, array.length), 0, value)
          field.valueRef = array
        },
        remove: (field, value, index) => {
          const array = field.value
          if (array.length === 0) return
          if (value) {
            for (let i = array.length - 1; i >= 0; i--) {
              if (array[i] === value) array.splice(i, 1)
            }
          } else if (index !== undefined) {
            if (index === 0) array.shift(value)
            else array.splice(index, 1)
          } else {
            array.pop()
          }
          field.valueRef = array
        }
      }
    })
  }

  _enrichObject () {
    this.define('object', function () {
      return {
        getProp: (field, key) => {
          const obj = field.valueRef
          if (!obj) return null
          return _.cloneDeep(obj[key])
        },
        setProp: (field, key, value) => {
          let obj = field.value
          if (!obj) obj = {}
          obj[key] = value
          field.valueRef = obj
        },
        unsetProp: (field, key) => {
          const obj = field.value
          if (!obj) return
          delete obj[key]
          field.valueRef = obj
        }
      }
    })
  }

  _defineQueue () {
    const queryPop = function (queueSchema, fieldValue) {
      if (fieldValue.length === 0) return null
      let removed
      if (queueSchema.queueType === 'FIFO') {
        removed = fieldValue[0]
        fieldValue.splice(0, 1)
      } else {
        removed = fieldValue[fieldValue.length - 1]
        fieldValue.pop()
      }
      return removed
    }

    this.define('queue', function (validator) {
      return {
        $validate: function ({ schema, messages }, path /* context */) {
          if (schema.max && !_.isInteger(schema.max)) {
            throw new DataFieldError(`[noMaxAttribute] The '${schema.type}' field must must have a positive integer 'max' attribute. Field name: '${path}'.`)
          }
          if (schema.queueType === undefined || ['FIFO', 'LIFO'].indexOf(schema.queueType) === -1) {
            throw new DataFieldError(`[invalidQueueType] The '${schema.type}' field must must have FIFO or LIFO as 'queueType' attribute. Field name: '${path}'.`)
          }
          return {
            source: `
              if (!(value instanceof Array)) {
                ${this.makeError({ type: 'array', actual: 'value', messages })}
              }
              if (value.length > ${schema.max}) {
                ${this.makeError({ type: 'arrayMax', actual: 'value', messages })}
              }
              return value
            `
          }
        },
        push: (field, value) => {
          const queueSchema = field.schema
          const fieldValue = field.value || []
          let removed = null
          if (queueSchema.max && fieldValue.length >= queueSchema.max) {
            removed = queryPop(queueSchema, fieldValue)
          }
          fieldValue.push(value)
          field.value = fieldValue
          return removed
        },
        pop: (field) => {
          const queueSchema = field.schema
          const fieldValue = field.value
          const removed = queryPop(queueSchema, fieldValue)
          field.value = fieldValue
          return removed
        }
      }
    })
  }

  _definePathFields () {
    // const checkAbsDirPath = function (value, schema, validator) {
    //   if (!value) return true
    //   let dirExists
    //   if (typeof schema.presence === 'boolean') {
    //     dirExists = fileUtils.directoryExistsSync(value)
    //     if (schema.presence === true && dirExists === false) {
    //       return validator.makeError('dirNotExists', null, value)
    //     }
    //     if (schema.presence === false && dirExists === true) {
    //       return validator.makeError('dirAlreadyExists', null, value)
    //     }
    //   }
    //   if (schema.ensure === true && dirExists !== true && !fileUtils.ensureDirSync(value)) {
    //     return validator.makeError('dirNotCreated', null, value)
    //   }
    //   return true
    // }
    //
    // const checkAbsFilePath = function (value, schema, validator) {
    //   if (!value) return true
    //   let fileExists
    //   if (typeof schema.presence === 'boolean') {
    //     fileExists = fileUtils.fileExistsSync(value)
    //     if (schema.presence === true && fileExists === false) {
    //       return validator.makeError('fileNotExists', null, value)
    //     }
    //     if (schema.presence === false && fileExists === true) {
    //       return validator.makeError('fileAlreadyExists', null, value)
    //     }
    //   }
    //   if (schema.ensure === true && fileExists !== true && !fileUtils.writeFileSync(value, '', 'utf8')) {
    //     return validator.makeError('fileNotCreated', null, value)
    //   }
    //   return true
    // }

    const rootPath = path.parse(process.cwd()).root

    const relToAbsPath = function (value, schema) {
      if (!value) return
      return path.join(schema.basePath, value)
    }

    const $validateAbsPath = (errorCodeName) => {
      return function ({ schema, messages } /*, path, context */) {
        return {
          source: `
          if(typeof value !== 'string') {
            ${this.makeError({ type: errorCodeName, actual: 'value', messages })}
          }
          value = value.trim()
          if(value.length === 0 || !encodeURI(value).startsWith('${encodeURI(rootPath)}')) {
            ${this.makeError({ type: errorCodeName, actual: 'value', messages })}
          }
          return value;
        `
        }
      }
    }

    const $validateRelPath = (errorCodeName) => {
      return function ({ schema, messages }, path /* context */) {
        const basePathError = new DataFieldError(`[invalidBasePath] The '${schema.type}' field must must have an absolute path as 'basePath' attribute. Field name: '${path}'.`)
        if (typeof schema.basePath !== 'string') throw basePathError
        schema.basePath = schema.basePath.trim()
        if (!schema.basePath.startsWith(rootPath)) throw basePathError
        return {
          source: `
          if(typeof value !== 'string') {
            ${this.makeError({ type: errorCodeName, actual: 'value', messages })}
          }
          value = value.trim()
          if(value.length === 0 || encodeURI(value).startsWith('${encodeURI(rootPath)}')) {
            ${this.makeError({ type: errorCodeName, actual: 'value', messages })}
          }
          return value;
        `
        }
      }
    }

    this.define('absDirPath', function (validator) {
      return {
        $validate: $validateAbsPath('notAbsDirPath'),
        exists: async (field) => {
          if (field.unset === true) return false
          return /* boolean await */ fileUtils.directoryExists(field.valueRef)
        },
        ensure: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.ensureDir(field.valueRef)
        },
        delete: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.removeDir(field.valueRef)
        }
      }
    })

    this.define('absFilePath', function (validator) {
      return {
        $validate: $validateAbsPath('notAbsFilePath'),
        exists: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.fileExists(field.valueRef)
        },
        ensure: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.writeFile(field.valueRef, '', 'utf8')
        },
        delete: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.removeFile(field.valueRef)
        }
      }
    })

    this.define('relDirPath', function (validator) {
      return {
        $validate: $validateRelPath('notRelDirPath'),
        fromAbsPath: (field, absPath) => {
          if (!absPath) return false
          const relPath = path.relative(field.schema.basePath, absPath)
          if (!relPath || relPath.length === 0 || relPath.startsWith('.')) return false
          field.value = relPath
          return true
        },
        toAbsPath: (field) => {
          if (field.unset === true) return null
          return relToAbsPath(field.valueRef, field.schema)
        },
        exists: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.directoryExists(relToAbsPath(field.valueRef, field.schema))
        },
        ensure: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.ensureDir(relToAbsPath(field.valueRef, field.schema))
        },
        delete: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.removeDir(relToAbsPath(field.valueRef, field.schema))
        },
        changeBasePath: (field, basePath) => {
          if (!fileUtils.isAbsolutePath(basePath)) return false
          field.schema = { basePath }
          return true
        }
      }
    })

    this.define('relFilePath', function (validator) {
      return {
        $validate: $validateRelPath('notRelFilePath'),
        fromAbsPath: (field, absPath) => {
          if (!absPath) return false
          const relPath = path.relative(field.schema.basePath, absPath)
          if (!relPath || relPath.length === 0 || relPath.startsWith('.')) return false
          field.value = relPath
          return true
        },
        toAbsPath: (field) => {
          if (field.unset === true) return null
          return relToAbsPath(field.valueRef, field.schema)
        },
        exists: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.fileExists(relToAbsPath(field.valueRef, field.schema))
        },
        ensure: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.writeFile(relToAbsPath(field.valueRef, field.schema), '', 'utf8')
        },
        delete: async (field) => {
          if (field.unset === true) return false
          return /* boolean */ fileUtils.removeFile(relToAbsPath(field.valueRef, field.schema))
        },
        changeBasePath: (field, basePath) => {
          if (!fileUtils.isAbsolutePath(basePath)) return false
          field.schema = { basePath }
          return true
        }
      }
    })
  }
}

module.exports = {
  DataFieldBuiltInFactory
}
