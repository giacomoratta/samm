const { fileUtils } = require('../utils/file.utils') // todo: remove

module.exports = {
  // todo: replace
  isAbsolutePath: fileUtils.isAbsolutePath,
  directoryExists: fileUtils.directoryExists,
  fileExists: fileUtils.fileExists,
  readJsonFile: fileUtils.readJsonFile,
  writeJsonFile: fileUtils.writeJsonFile,
  removeFile: fileUtils.removeFile
}
