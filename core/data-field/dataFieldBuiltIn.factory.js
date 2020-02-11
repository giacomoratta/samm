/**
 * This is also an example on how a new DataFieldFactory should be created.
 * The project should have a DataFieldFactory exported as singleton, which must contain messages, defined fields, etc.
 * Before exporting it, the method init() must be called in order to instantiate the internal validator which will be
 * used by all the DataField(s) created in the project.
 *
 *  1) extends the a DataFieldFactory class
 *  2) declare messages
 *  3) define fields
 *  4) export as singleton (when used in project)
 *
 */

const _ = require('lodash')
const { fileUtils } = require('../utils/file.utils')
const { DataFieldFactory } = require('../dataField.factory')

class DataFieldBuiltInFactory extends DataFieldFactory {
  constructor () {
    super()

    this.message({
      notAnArray: 'The \'{field}\' field must be an array! Actual: {actual}',
      noMaxAttribute: 'The \'{field}\' field must must have a positive integer \'max\' attribute! Actual: {actual}',
      invalidQueueType: 'The queue \'{field}\' field must have FIFO or LIFO \'queueType\' attribute! Actual: {actual}',
      invalidBasePath: 'The \'{field}\' field must have an absolute path as basePath! Actual: {actual}',
      dirNotExists: 'Directory \'{field}\' does not exists! Actual: {actual}',
      fileNotExists: 'File \'{field}\' does not exists! Actual: {actual}',
      notAbsDirPath: 'Directory \'{field}\' is not an absolute path! Actual: {actual}',
      notAbsFilePath: 'File \'{field}\' is not an absolute path! Actual: {actual}',
      notRelDirPath: 'Directory \'{field}\' is not a relative path! Actual: {actual}',
      notRelFilePath: 'File \'{field}\' is not a relative path! Actual: {actual}',
      dirNotCreated: 'Directory \'{field}\' has not been created! Actual: {actual}',
      fileNotCreated: 'File \'{field}\' has not been created! Actual: {actual}',
      dirNotDeleted: 'Directory \'{field}\' has not been deleted! Actual: {actual}',
      fileNotDeleted: 'File \'{field}\' has not been deleted! Actual: {actual}'
    })

    this._defineQueue()
    this._definePathFields()
  }

  _defineQueue () {
    const queryPop = function (queueType, queueSchema, fieldValue) {
      if (fieldValue.length === 0) return null
      let removed
      if (queueType === 'FIFO') {
        removed = fieldValue[0]
        fieldValue.splice(0, 1)
      } else {
        removed = fieldValue[queueSchema.max - 1]
        fieldValue.pop()
      }
      return removed
    }

    this.define('queue', function (validator) {
      return {
        validate: (value, schema) => {
          if (!_.isNull(value) && !_.isArray(value)) {
            return validator.makeError('notAnArray', null, value)
          }
          if (!schema.max || schema.max < 1 || !_.isInteger(schema.max)) {
            return validator.makeError('noMaxAttribute', null, value)
          }
          if (schema.queue === undefined || ['FIFO', 'LIFO'].indexOf(schema.queue) === -1) {
            return validator.makeError('invalidQueueType', null, value)
          }
          if (value.length > schema.max) {
            return validator.makeError('arrayMax', null, value)
          }
          return true
        },
        push: (field, value) => {
          const queueSchema = field.schema
          const queueType = queueSchema.type || 'FIFO'
          const fieldValue = field.rawValue
          let removed = null
          if (fieldValue.length >= queueSchema.max) {
            removed = queryPop(queueType, queueSchema, fieldValue)
          }
          fieldValue.push(value)
          field.rawValue = fieldValue
          return removed
        },
        pop: (field) => {
          const queueSchema = field.schema
          const queueType = queueSchema.type || 'FIFO'
          const fieldValue = field.rawValue
          const removed = queryPop(queueType, queueSchema, fieldValue)
          field.rawValue = fieldValue
          return removed
        }
      }
    })
  }

  _definePathFields () {
    const checkAbsDirPath = function (value, schema, validator) {
      if (schema.default) return true
      const dirExists = fileUtils.directoryExistsSync(value)
      if (schema.checkExists === true && dirExists === false) {
        return validator.makeError('dirNotExists', null, value)
      }
      if (schema.deleteIfExists === true && dirExists === true && !fileUtils.removeDirSync(value)) {
        return validator.makeError('dirNotDeleted', null, value)
      }
      if (schema.createIfNotExists === true && dirExists === false && !fileUtils.ensureDirSync(value)) {
        return validator.makeError('dirNotCreated', null, value)
      }
      return true
    }

    const checkAbsFilePath = function (value, schema, validator) {
      if (schema.default) return true
      const fileExists = fileUtils.fileExistsSync(value)
      if (schema.checkExists === true && fileExists === false) {
        return validator.makeError('fileNotExists', null, value)
      }
      if (schema.deleteIfExists === true && fileExists === true && !fileUtils.removeFileSync(value)) {
        return validator.makeError('fileNotDeleted', null, value)
      }
      if (schema.createIfNotExists === true && fileExists === false && !fileUtils.writeFileSync(value, '', 'utf8')) {
        return validator.makeError('fileNotCreated', null, value)
      }
      return true
    }

    const relativePathTransform = function (value, schema) {
      if (!value) return
      return path.join(schema.basePath, value)
    }

    this.define('absDirPath', function (validator) {
      return {
        validate: (value, schema) => {
          if (!fileUtils.isAbsolutePath(value)) {
            return validator.makeError('notAbsDirPath', null, value)
          }
          return checkAbsDirPath(value, schema)
        }
      }
    })

    this.define('absFilePath', function (validator) {
      return {
        validate: (value, schema) => {
          if (!fileUtils.isAbsolutePath(value)) {
            return validator.makeError('notAbsFilePath', null, value)
          }
          return checkAbsFilePath(value, schema)
        }
      }
    })

    this.define('relDirPath', function (validator) {
      return {
        validate: (value, schema) => {
          if (!fileUtils.isRelativePath(value)) {
            return validator.makeError('notRelDirPath', null, value)
          }
          if (!fileUtils.isAbsolutePath(schema.basePath)) {
            return validator.makeError('invalidBasePath', null, schema.basePath)
          }
          value = relativePathTransform(value, schema)
          return checkAbsDirPath(value, schema)
        },
        get: relativePathTransform
      }
    })

    this.define('relFilePath', function (validator) {
      return {
        validate: (value, schema) => {
          if (!fileUtils.isRelativePath(value)) {
            return validator.makeError('notRelFilePath', null, value)
          }
          if (!fileUtils.isAbsolutePath(schema.basePath)) {
            return validator.makeError('invalidBasePath', null, schema.basePath)
          }
          value = relativePathTransform(value, schema)
          return checkAbsFilePath(value, schema)
        },
        get: relativePathTransform
      }
    })
  }
}

module.exports = {
  DataFieldBuiltInFactory
}
