const FastestValidator = require('fastest-validator')
const fileUtils = require('../utils/file.utils')
const transform = require('./transform')

const validator = new FastestValidator({
  messages: {
    // Register our new error message text
    notPath: 'The \'{field}\' field must be an even number! Actual: {actual}',
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
  }
})

const checkAbsDirPath = (value, schema) => {
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

const checkAbsFilePath = (value, schema) => {
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

validator.add('absDirPath', (value, schema) => {
  if (!fileUtils.isAbsolutePath(value)) {
    return validator.makeError('notAbsDirPath', null, value)
  }
  return checkAbsDirPath(value, schema)
})

validator.add('absFilePath', (value, schema) => {
  if (!fileUtils.isAbsolutePath(value)) {
    return validator.makeError('notAbsFilePath', null, value)
  }
  return checkAbsFilePath(value, schema)
})

validator.add('relDirPath', (value, schema) => {
  if (!fileUtils.isRelativePath(value)) {
    return validator.makeError('notRelDirPath', null, value)
  }
  if (!fileUtils.isAbsolutePath(schema.basePath)) {
    return validator.makeError('invalidBasePath', null, schema.basePath)
  }
  value = transform.relDirPathTransform(value, schema)
  return checkAbsDirPath(value, schema)
})

validator.add('relFilePath', (value, schema) => {
  if (!fileUtils.isRelativePath(value)) {
    return validator.makeError('notRelFilePath', null, value)
  }
  if (!fileUtils.isAbsolutePath(schema.basePath)) {
    return validator.makeError('invalidBasePath', null, schema.basePath)
  }
  value = transform.relFilePathTransform(value, schema)
  return checkAbsFilePath(value, schema)
})

module.exports = validator
