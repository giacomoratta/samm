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
    fs.lstat(absolutePath, (err, stats) => {
      if (err) return reject(err)
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
    throw new PathInfoError(`Invalid main path: ${absolutePath}`)
  }

  const pInfo = path.parse(absolutePath)
  if (!pInfo) {
    throw new PathInfoError(`Cannot parse the main path ${absolutePath}`)
  }

  if (!relRootPath) return pInfo

  if (!_.isString(relRootPath) || !utils.isAbsolutePath(relRootPath)) {
    throw new PathInfoError(`Invalid relative root path: ${relRootPath}`)
  }

  const pRootInfo = path.parse(relRootPath)
  if (!pRootInfo) {
    throw new PathInfoError(`Cannot parse relative root path ${absolutePath}`)
  }

  return pInfo
}

utils.setBasicPathInfo = ({ pInfo, pStats, absolutePath }) => {
  if (pInfo.ext.startsWith('.')) pInfo.ext = pInfo.ext.slice(1)
  pInfo.path = absolutePath
  pInfo.level = 1
  pInfo.size = (pStats.size ? pStats.size : 0)
  pInfo.createdAt = (new Date(pStats.birthtime)).getTime()
  pInfo.modifiedAt = (new Date(pStats.mtime)).getTime()
  pInfo.isFile = pStats.isFile()
  pInfo.isDirectory = pStats.isDirectory()
  return true
}

module.exports = utils
