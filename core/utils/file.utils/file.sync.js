const { _ } = require('../lodash.extended')
const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const iconv = require('iconv-lite')

const stringToBuffer = (string) => { return Buffer.from('' + (string || ''), 'binary') }

const libUtils = {}

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

libUtils.fileExistsSync = (pathString) => {
  if (!_.isString(pathString)) return false
  return fs.existsSync(pathString)
}

libUtils.readFileSync = (pathString, encoding, flag) => {
  try {
    if (!encoding) encoding = 'utf8'
    if (!flag) flag = 'r'
    if (encoding === 'iso88591') {
      const fileContent = fs.readFileSync(pathString, {
        encoding: 'binary',
        flag: flag
      }).toString()
      return iconv.decode(stringToBuffer(fileContent), 'iso88591')
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
  const fileContent = libUtils.readFileSync(pathString, 'utf8')
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

libUtils.touchFileSync = (pathString) => {
  return libUtils.writeFileSync(pathString, '', 'utf8')
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
  return libUtils.writeFileSync(pathString, fileContent, 'utf8')
}

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

libUtils.uniqueFileNameSync = ({ parentPath, fileName }) => {
  let newDestinationPath = path.join(parentPath, fileName)
  const parsedFile = path.parse(newDestinationPath)
  let i = 1
  while (libUtils.fileExistsSync(newDestinationPath) === true && i < 1000) {
    newDestinationPath = path.join(parsedFile.dir, `${parsedFile.name}_${i}${parsedFile.ext}`)
    i++
  }
  if (i >= 1000) return null
  return newDestinationPath
}

libUtils.getFilePathFromPool = (filePath, fileName, poolSize = 3, maxFileSize = 2100000) => {
  // todo
  // get files in path
  // filter by fileName as prefix

  // get latest file created

  // if size > maxFileSize ...create new file
  // set new file name.. if suffix>poolSize, suffix='.01'
  // if new file exists, remove and return
  // else ...return this file
}

module.exports = libUtils
