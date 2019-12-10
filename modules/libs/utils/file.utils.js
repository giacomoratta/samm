const _ = require('./lodash')
const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const rimraf = require('rimraf') /* A "rm -rf" util for nodejs */
const iconv = require('iconv-lite')

const libUtils = {}

libUtils.pathBasename = path.basename

libUtils.pathExtname = path.extname

libUtils.pathDirname = path.dirname

libUtils.pathParse = path.parse

libUtils.pathJoin = path.join

libUtils.pathSeparator = path.sep

libUtils.setAsAbsPath = (relPath, isFile, absPath) => {
  relPath = _.trim(relPath)
  // if(isFile===true && _.endsWith(relPath,libUtils.pathSeparator)) relPath=relPath.substr(0,relPath.length-1)
  if (!absPath) return path.resolve(relPath) + (isFile !== true ? libUtils.pathSeparator : '')
  return libUtils.pathJoin(absPath, relPath, (isFile !== true ? libUtils.pathSeparator : ''))
}

libUtils.equalPaths = (p1, p2) => {
  p1 = _.toLower(libUtils.pathJoin(p1, libUtils.pathSeparator))
  p2 = _.toLower(libUtils.pathJoin(p2, libUtils.pathSeparator))
  if (p1.length > p2.length) return p1.endsWith(p2)
  if (p1.length <= p2.length) return p2.endsWith(p1)
}

/* UTILS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.pathChangeFilename = (pathString, changeFn) => {
  const _pInfo = libUtils.pathParse(pathString)
  const _pInfoName = changeFn(_pInfo.name, _pInfo)
  return libUtils.pathJoin(_pInfo.dir, _pInfoName + _pInfo.ext)
}

libUtils.pathChangeDirname = (pathString, changeFn) => {
  const _pInfo = libUtils.pathParse(pathString)
  const _pInfoBase = changeFn(_pInfo.base, _pInfo)
  return libUtils.pathJoin(_pInfo.dir, _pInfoBase)
}

/* CHECKS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.isRelativePath = (p) => {
  return !libUtils.isAbsolutePath(p)
}

libUtils.isAbsolutePath = (p) => {
  return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/')
}

libUtils.isAbsoluteParentDirSync = (pathString, checkExists) => {
  if (!_.isString(pathString)) return false
  if (!path.isAbsolute(pathString)) return false
  if (checkExists !== true) return true
  const psDirname = libUtils.pathDirname(pathString)
  return libUtils.directoryExistsSync(psDirname)
}

libUtils.checkAndSetDuplicatedFileNameSync = (pathString, renameFn) => {
  if (!_.isFunction(renameFn)) {
    renameFn = function (pStr, index) {
      return libUtils.pathChangeFilename(pStr, function (oldName) {
        return oldName + '_' + index
      })
    }
  }
  return _.noDuplicatedValues(null, pathString, (v, cv, i /*, a */) => {
    if (!fs.existsSync(cv)) return true // found a free value
    cv = renameFn(v, i)
    // console.log('checkAndSetDuplicatedFileNameSync ... changing '+v+' to '+cv)
    return cv
  })
}

libUtils.checkAndSetDuplicatedDirectoryNameSync = (pathString, renameFn) => {
  if (!_.isFunction(renameFn)) {
    renameFn = function (pStr, index) {
      return libUtils.pathChangeDirname(pStr, function (oldName) {
        return oldName + '_' + index
      })
    }
  }
  return _.noDuplicatedValues(null, pathString, (v, cv, i /*, a */) => {
    if (!fs.existsSync(cv)) return true // found a free value
    cv = renameFn(v, i)
    // console.log('checkAndSetDuplicatedDirectoryNameSync ... changing '+v+' to '+cv)
    return cv
  })
}

libUtils.checkAndSetPathSync = (pathString, callback) => {
  if (!_.isString(pathString)) return null
  if (!fs.existsSync(pathString)) return null
  pathString = path.resolve(pathString) + libUtils.pathSeparator
  if (callback) callback(pathString)
  return pathString
}

libUtils.fileExistsSync = (pathString) => {
  if (!_.isString(pathString)) return false
  return fs.existsSync(pathString)
}

libUtils.directoryExistsSync = (pathString) => {
  if (!_.isString(pathString)) return false
  return fs.existsSync(pathString)
}

/* CHECKS  - ASYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.fileExists = (pathString) => {
  return new Promise(function (resolve) {
    return resolve(libUtils.fileExistsSync(pathString))
  })
}

libUtils.directoryExists = (pathString) => {
  return new Promise(function (resolve) {
    return resolve(libUtils.directoryExistsSync(pathString))
  })
}

/* PATH R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.getPathStatsSync = (pathString) => {
  // usage: isDirectory, isFile
  try {
    return fs.lstatSync(pathString)
  } catch (e) {
    // console.error(e)
  }
}

/* FILE R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.readFileSync = (pathString, encoding, flag) => {
  try {
    if (!encoding) encoding = 'utf8'
    if (!flag) flag = 'r'
    if (encoding === 'iso88591') {
      const fcont = fs.readFileSync(pathString, {
        encoding: 'binary',
        flag: flag
      }).toString()
      return iconv.decode(fcont, 'iso88591')
    } else {
      return fs.readFileSync(pathString, {
        encoding: encoding,
        flag: flag
      })
    }
  } catch (e) {
    // console.error(e)
    return false
  }
}

libUtils.readJsonFileSync = (pathString) => {
  const fileContent = libUtils.readFileSync(pathString, 'iso88591')
  if (!_.isString(fileContent)) return false
  try {
    const jsonObj = JSON.parse(fileContent)
    if (!_.isObject(jsonObj)) return null
    return jsonObj
  } catch (e) {
    // console.error(e)
    return null
  }
}

libUtils.readTextFileSync = (pathString) => {
  const fileContent = libUtils.readFileSync(pathString, 'iso88591')
  if (fileContent === false || _.isNil(fileContent)) return false
  return _.trim(fileContent)
}

libUtils.writeFileSync = (pathString, fileContent, encoding, flag, mode) => {
  try {
    if (!encoding) encoding = 'utf8'
    if (!flag) flag = 'w'
    if (!mode) mode = 0o666
    if (encoding === 'iso88591') {
      fileContent = iconv.decode(fileContent, 'iso88591')
      fs.writeFileSync(pathString, fileContent, {
        encoding: 'binary',
        flag: flag,
        mode: mode
      })
    } else {
      fs.writeFileSync(pathString, fileContent, {
        encoding: encoding,
        flag: flag,
        mode: mode
      })
    }
    return true
  } catch (e) {
    // console.error(e)
    return false
  }
}

libUtils.writeTextFileSync = (pathString, fileContent) => {
  return libUtils.writeFileSync(pathString, fileContent, 'iso88591')
}

libUtils.writeJsonFileSync = (pathString, jsonObj, space) => {
  if (!_.isObject(jsonObj)) return false

  if (space === false) space = null
  else space = '\t'

  let fileContent = ''
  try {
    fileContent = JSON.stringify(jsonObj, null, space)
  } catch (e) {
    // console.error(e)
    return false
  }
  return libUtils.writeTextFileSync(pathString, fileContent)
}

/* FILE R/W - ASYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.writeTextFile = (pathTo, text) => {
  return new Promise(function (resolve, reject) {
    const _retValue = {
      err: null,
      pathTo: pathTo
    }
    fs.writeFile(pathTo, text, 'utf8', function (err) {
      if (err) {
        _retValue.err = err
        return reject(_retValue)
      }
      return resolve(_retValue)
    })
  })
}

/* DIRECTORY R/W - ASYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.copyDirectory = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: false,
    errorOnExist: false
  }, options)
  return new Promise(function (resolve, reject) {
    const _retValue = {
      err: null,
      pathFrom: pathFrom,
      pathTo: pathTo
    }
    fsExtra.copy(pathFrom, pathTo, options, function (err) {
      if (err) {
        _retValue.err = err
        // console.log(_retValue)
        return reject(_retValue)
      }
      return resolve(_retValue)
    })
  })
}

/* DIRECTORY R/W - SYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.ensureDirSync = (pathString) => {
  try {
    fsExtra.ensureDirSync(pathString)
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
  const _retValue = {
    err: null,
    pathFrom: pathFrom,
    pathTo: pathTo
  }
  try {
    fsExtra.copySync(pathFrom, pathTo, options)
  } catch (err) {
    _retValue.err = err
    // console.error(_retValue)
  }
  return _retValue
}

libUtils.moveDirectorySync = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: false,
    setDirName: false,
    errorOnExist: false
  }, options)
  if (options.setDirName === true) {
    pathTo = libUtils.pathJoin(pathTo, libUtils.pathBasename(pathFrom))
  }
  const _retValue = {
    err: null,
    pathFrom: pathFrom,
    pathTo: pathTo
  }

  try {
    fsExtra.moveSync(pathFrom, pathTo, options)
  } catch (err) {
    _retValue.err = err
    // console.error(_retValue)
  }
  return _retValue
}

libUtils.readDirectorySync = (pathString, preFn, callback) => {
  if (!callback) callback = function () {}
  if (!preFn) preFn = function () {}
  let items = null
  try {
    items = fs.readdirSync(pathString)
  } catch (e) {
    // console.error(e)
    return null
  }
  if (!items) return null
  preFn(items)
  for (let i = 0; i < items.length; i++) {
    callback(items[i], i, items)
  }
  return items
}

libUtils.removeDirSync = (pathString) => {
  try {
    return rimraf.sync(pathString)
  } catch (e) {
    // console.error(e.message)
  }
}

/* FileSystem R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.removeFileSync = (pathString) => {
  try {
    return fs.unlinkSync(pathString)
  } catch (e) {
    // console.error(e.message)
  }
}

libUtils.copyFileSync = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: true,
    errorOnExist: false
  }, options)
  const _retValue = {
    err: null,
    pathFrom: pathFrom,
    pathTo: pathTo
  }
  try {
    fsExtra.copySync(pathFrom, pathTo, options)
  } catch (err) {
    _retValue.err = err
    // console.error(_retValue)
  }
  return _retValue
}

libUtils.copyFile = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: true,
    errorOnExist: false
  }, options)
  return new Promise(function (resolve, reject) {
    const _retValue = {
      err: null,
      pathFrom: pathFrom,
      pathTo: pathTo
    }
    fsExtra.copy(pathFrom, pathTo, options, function (err) {
      if (err) {
        _retValue.err = err
        // console.error(_retValue)
        return reject(_retValue)
      }
      return resolve(_retValue)
    })
  })
}

module.exports = libUtils
