const _ = require('./lodash.extended')
const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const rimraf = require('rimraf') /* A "rm -rf" util for nodejs */
const iconv = require('iconv-lite')

const stringToBuffer = (string) => { return Buffer.from('' + (string || ''), 'binary') }

const libUtils = {}

libUtils.setAsAbsPath = (relPath, isFile, absPath) => {
  relPath = _.trim(relPath)
  // if(isFile===true && _.endsWith(relPath,path.sep)) relPath=relPath.substr(0,relPath.length-1)
  if (!absPath) return path.resolve(relPath) + (isFile !== true ? path.sep : '')
  return path.join(absPath, relPath, (isFile !== true ? path.sep : ''))
}

libUtils.equalPaths = (p1, p2) => {
  p1 = _.toLower(path.join(p1, path.sep))
  p2 = _.toLower(path.join(p2, path.sep))
  if (p1.length > p2.length) return p1.endsWith(p2)
  if (p1.length <= p2.length) return p2.endsWith(p1)
}

/* UTILS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.pathChangeFilename = (pathString, changeFn) => {
  const _pInfo = path.parse(pathString)
  const _pInfoName = changeFn(_pInfo.name, _pInfo)
  return path.join(_pInfo.dir, _pInfoName + _pInfo.ext)
}

libUtils.pathChangeDirname = (pathString, changeFn) => {
  const _pInfo = path.parse(pathString)
  const _pInfoBase = changeFn(_pInfo.base, _pInfo)
  return path.join(_pInfo.dir, _pInfoBase)
}

/* CHECKS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.isRelativePath = (p) => {
  return !libUtils.isAbsolutePath(p)
}

libUtils.isAbsolutePath = (p) => {
  return path.normalize(p + path.sep) === path.normalize(path.resolve(p) + path.sep)
}

libUtils.isAbsoluteParentDirSync = (pathString, checkExists) => {
  if (!_.isString(pathString)) return false
  if (!path.isAbsolute(pathString)) return false
  if (checkExists !== true) return true
  const psDirname = path.dirname(pathString)
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

libUtils.checkAndSetPathSync = (pathString, callback) => { // todo ???
  if (!_.isString(pathString)) return null
  if (!fs.existsSync(pathString)) return null
  pathString = path.resolve(pathString) + path.sep
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
    fs.access(pathString, fs.constants.F_OK, (err) => {
      resolve({
        exists: !err,
        error: err
      })
    })
  })
}

libUtils.directoryExists = libUtils.fileExists

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
      return iconv.decode(stringToBuffer(fcont), 'iso88591')
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
      if (_.isNil(fileContent)) fileContent = ''
      fileContent = iconv.decode(stringToBuffer(fileContent), 'iso88591')
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
    const result = {
      err: null,
      pathTo: pathTo
    }
    fs.writeFile(pathTo, text, 'utf8', function (err) {
      if (err) {
        result.err = err
        return reject(result)
      }
      return resolve(result)
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
    const result = {
      err: null,
      pathFrom: pathFrom,
      pathTo: pathTo
    }
    fsExtra.copy(pathFrom, pathTo, options, function (err) {
      if (err) {
        result.err = err
        // console.log(result)
        return reject(result)
      }
      return resolve(result)
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

libUtils.removeDirSync = (pathString) => {
  try {
    rimraf.sync(pathString)
    return true
  } catch (e) {
    // console.error(e)
    return false
  }
}

/* FileSystem R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.removeFileSync = (pathString) => {
  try {
    fs.unlinkSync(pathString)
    return true
  } catch (e) {
    // console.error(e.message)
    return false
  }
}

libUtils.copyFileSync = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: true,
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

libUtils.copyFile = (pathFrom, pathTo, options) => {
  options = _.merge({
    overwrite: true,
    errorOnExist: false
  }, options)
  return new Promise(function (resolve, reject) {
    const result = {
      err: null,
      pathFrom: pathFrom,
      pathTo: pathTo
    }
    fsExtra.copy(pathFrom, pathTo, options, function (err) {
      if (err) {
        result.err = err
        // console.error(result)
        return reject(result)
      }
      return resolve(result)
    })
  })
}

module.exports = libUtils
