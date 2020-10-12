const commonLib = require('./common')
const directoryLib = require('./directory')
const directorySyncLib = require('./directory.sync')
const fileLib = require('./file')
const fileSyncLib = require('./file.sync')

module.exports = {
  fileUtils: {
    ...commonLib,
    ...directoryLib,
    ...directorySyncLib,
    ...fileLib,
    ...fileSyncLib
  }
}
