const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const rimraf = require('rimraf') /* A "rm -rf" util for nodejs */

const libUtils = {}

libUtils.isAbsoluteParentDirSync = (pathString, checkExists) => {
  if (!_.isString(pathString)) return false
  if (!path.isAbsolute(pathString)) return false
  if (checkExists !== true) return true
  const psDirname = path.dirname(pathString)
  return libUtils.directoryExistsSync(psDirname)
}

libUtils.checkAndSetPathSync = (pathString, callback) => {
  if (!_.isString(pathString)) return null
  if (!fs.existsSync(pathString)) return null
  pathString = path.resolve(pathString) + path.sep
  if (callback) callback(pathString)
  return pathString
}

libUtils.directoryExistsSync = (pathString) => {
  if (!_.isString(pathString)) return false
  return fs.existsSync(pathString)
}

libUtils.ensureDirSync = (pathString) => {
  try {
    fsExtra.ensureDirSync(pathString)
  } catch (e) {
    return false
  }
  return true
}

libUtils.ensureParentDirSync = (pathString) => {
  try {
    fsExtra.ensureDirSync(path.parse(pathString).dir)
  } catch (e) {
    return false
  }
  return true
}

libUtils.copyDirectorySync = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: false,
    errorOnExist: false
  }, options)
  const result = {
    err: null,
    pathFrom: pathFrom,
    pathTo: pathTo
  }
  try {
    fsExtra.copySync(pathFrom, pathTo, options)
  } catch (err) {
    result.err = err
    // console.error(result)
  }
  return result
}

libUtils.moveDirectorySync = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: false,
    setDirName: false,
    errorOnExist: false
  }, options)
  if (options.setDirName === true) {
    pathTo = path.join(pathTo, path.basename(pathFrom))
  }
  const result = {
    err: null,
    pathFrom: pathFrom,
    pathTo: pathTo
  }

  try {
    fsExtra.moveSync(pathFrom, pathTo, options)
  } catch (err) {
    result.err = err
    // console.error(result)
  }
  return result
}

libUtils.readDirectorySync = (pathString, preProcessItemsFn, itemFn) => {
  if (!itemFn) itemFn = function () {}
  if (!preProcessItemsFn) preProcessItemsFn = function () {}
  let items = null
  try {
    items = fs.readdirSync(pathString)
  } catch (e) {
    // console.error(e)
    return null
  }
  if (!items) return null
  preProcessItemsFn(items)
  for (let i = 0; i < items.length; i++) {
    itemFn(items[i], i, items)
  }
  return items
}

libUtils.uniqueDirectoryNameSync = (parentPath, directoryName, attempts = 1000) => {
  let testDestinationPath = path.join(parentPath, directoryName)
  let i = Math.min(1, attempts)
  let uniqueDirName = directoryName
  while (libUtils.directoryExistsSync(testDestinationPath) === true && (i === -1 || i < attempts)) {
    uniqueDirName = `${directoryName}_${i}`
    testDestinationPath = path.join(parentPath, uniqueDirName)
    i++
  }
  if (i >= attempts && attempts !== -1) return null
  return uniqueDirName
}

libUtils.removeDirSync = (pathString) => {
  try {
    rimraf.sync(pathString)
    return true
  } catch (e) {
    // console.error(e)
    return false
  }
}

module.exports = libUtils
