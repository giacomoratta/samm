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

    this._defineCircularArray()
    // this._defineRelFilePath()
    // this._defineRelDirPath()
    // this._defineAbsFilePath()
    // this._defineAbsDirPath()
  }

  _defineCircularArray () {
    this.define('', function (validator) {
      return {
        validate: (value, schema) => {
          if (!_.isNull(value) && !_.isArray(value)) {
            return validator.makeError('notAnArray', null, value)
          }
          if (!schema.max || schema.max < 1 || !_.isInteger(schema.max)) {
            return validator.makeError('noMaxAttribute', null, value)
          }
          if (value.length > schema.max) {
            return validator.makeError('arrayMax', null, value)
          }
          return true
        },
        // add: (field) => { },
        // remove: (field) => { },
        // clean: (field) => { },
        get: (value) => {
          return value.join('---')
        }
        // set: (value) => { }
      }
    })
  }

  // _defineRelFilePath() {}
  // _defineRelDirPath() {}
  // _defineAbsFilePath() {}
  // _defineAbsDirPath() {}
}

module.exports = {
  DataFieldBuiltInFactory
}
