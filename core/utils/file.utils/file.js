const { _ } = require('../lodash.extended')
const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const iconv = require('iconv-lite')

const stringToBuffer = (string) => { return Buffer.from('' + (string || ''), 'binary') }

const libUtils = {}

libUtils.fileExists = (pathString) => { // = libUtils.directoryExists
  return new Promise((resolve) => {
    fs.access(pathString, fs.constants.F_OK, (error) => {
      if (!error) return resolve(true)
      return resolve(false)
    })
  })
}

libUtils.readFile = (pathString, encoding, flag) => {
  return new Promise((resolve, reject) => {
    try {
      if (!encoding) encoding = 'utf8'
      if (!flag) flag = 'r'
      if (encoding === 'iso88591') {
        fs.readFile(pathString, {
          encoding: 'binary',
          flag: flag
        }, (error, fileContent) => {
          if (error) return reject(error)
          return resolve(iconv.decode(stringToBuffer(fileContent), 'iso88591'))
        })
      } else {
        fs.readFile(pathString, {
          encoding: encoding,
          flag: flag
        }, (error, fileContent) => {
          if (error) return reject(error)
          return resolve(fileContent)
        })
      }
    } catch (e) {
      return reject(e)
    }
  })
}

libUtils.readJsonFile = (pathString) => {
  return libUtils.readFile(pathString, 'utf8').then((fileContent) => {
    if (!_.isString(fileContent)) return false
    try {
      const jsonObj = JSON.parse(fileContent)
      if (!_.isObject(jsonObj)) return null
      return jsonObj
    } catch (e) {
      // console.error(e)
      return null
    }
  })
}

libUtils.readTextFile = (pathString) => {
  return libUtils.readFile(pathString, 'iso88591').then((fileContent) => {
    if (fileContent === false || _.isNil(fileContent)) return false
    return _.trim(fileContent)
  })
}

libUtils.touchFile = (pathString) => {
  return libUtils.writeFile(pathString, '', 'utf8')
}

libUtils.writeFile = (pathString, fileContent, encoding, flag, mode) => {
  return new Promise((resolve, reject) => {
    try {
      if (!encoding) encoding = 'utf8'
      if (!flag) flag = 'w'
      if (!mode) mode = 0o666
      if (encoding === 'iso88591') {
        if (_.isNil(fileContent)) fileContent = ''
        fileContent = iconv.decode(stringToBuffer(fileContent), 'iso88591')
        fs.writeFile(pathString, fileContent, {
          encoding: 'binary',
          flag: flag,
          mode: mode
        }, (error) => {
          if (error) return reject(error)
          return resolve(true)
        })
      } else {
        fs.writeFile(pathString, fileContent, {
          encoding: encoding,
          flag: flag,
          mode: mode
        }, (error) => {
          if (error) return reject(error)
          return resolve(true)
        })
      }
    } catch (e) {
      // console.error(e)
      reject(e)
    }
  })
}

libUtils.writeJsonFile = (pathTo, jsonObj, space) => {
  const negativePromise = new Promise(function (resolve, reject) { resolve(false) })
  if (!_.isObject(jsonObj)) return negativePromise
  if (space === false) space = null
  else space = '\t'
  let fileContent = ''
  try {
    fileContent = JSON.stringify(jsonObj, null, space)
  } catch (e) {
    // console.error(e)
    return negativePromise
  }
  return libUtils.writeFile(pathTo, fileContent, 'utf8')
}

libUtils.writeTextFile = (pathTo, text) => {
  return libUtils.writeFile(pathTo, text, 'iso88591')
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

libUtils.removeFile = (pathString) => {
  return new Promise((resolve, reject) => {
    fs.unlink(pathString, (err) => {
      if (err) return reject(err)
      resolve(true)
    })
  })
}

libUtils.uniqueFileName = async ({ parentPath, fileName }) => {
  let newDestinationPath = path.join(parentPath, fileName)
  const parsedFile = path.parse(newDestinationPath)
  let i = 1
  while (await libUtils.fileExists(newDestinationPath) === true && i < 1000) {
    newDestinationPath = path.join(parsedFile.dir, `${parsedFile.name}_${i}${parsedFile.ext}`)
    i++
  }
  if (i >= 1000) return null
  return newDestinationPath
}

module.exports = libUtils
