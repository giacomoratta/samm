const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const { PathInfoError } = require('./pathInfoError.class')

const utils = {}

utils.isAbsolutePath = (p) => {
  return path.normalize(p + path.sep) === path.normalize(path.resolve(p) + path.sep)
}

utils.fileSizeToStr = (fileSize) => {
  if (fileSize < 1024) return fileSize + ' B'
  if (fileSize < 1048576) return Math.round(fileSize / 1024) + ' KB'
  if (fileSize < 1073741824) return Math.round(fileSize / 1048576) + ' MB'
  if (fileSize < 1099511627776) return Math.round(fileSize / 1073741824) + ' GB'
  return Math.round(fileSize / (1099511627776)) + ' TB'
}

utils.lstatSync = (absolutePath) => {
  try {
    return fs.lstatSync(absolutePath)
  } catch (e) {
    throw new PathInfoError(`Cannot get path stats of ${absolutePath}`)
  }
}

utils.lstat = async (absolutePath) => {
  const fstatResult = new Promise((resolve, reject) => {
    fs.fstat(absolutePath, (err, stats) => {
      if(err) return reject(err)
      resolve(stats)
    })
  })
  try {
    return await fstatResult
  } catch (e) {
    throw new PathInfoError(`Cannot get path stats of ${absolutePath}`)
  }
}

utils.checkParameters = ({ absolutePath, relRootPath }) => {

  if (!_.isString(absolutePath) || !utils.isAbsolutePath(absolutePath)) {
    throw new PathInfoError(`Main path ${absolutePath} is not an absolute path`)
  }

  const pInfo = path.parse(absolutePath)
  if (!pInfo) {
    throw new PathInfoError(`Cannot parse ${absolutePath}`)
  }

  if(!relRootPath) return pInfo

  if (!_.isString(relRootPath)) {
    throw new PathInfoError(`Invalid relative root path: ${relRootPath}`)
  }

  if (!utils.isAbsolutePath(relRootPath)) {
    throw new PathInfoError(`Relative root ${relRootPath} is not an absolute path`)
  }

  return pInfo
}

utils.setBasicPathInfo = ({ pInfo, pStats, absolutePath }) => {
  if (pInfo.ext.startsWith('.')) pInfo.ext = pInfo.ext.slice(1)
  pInfo.path = absolutePath
  pInfo.level = 1
  pInfo.size = (pStats.size ? pStats.size : 0)
  pInfo.createdAt = pStats.birthtime
  pInfo.modifiedAt = pStats.mtime
  pInfo.isFile = pStats.isFile()
  pInfo.isDirectory = pStats.isDirectory()
  return true
}


module.exports = utils
