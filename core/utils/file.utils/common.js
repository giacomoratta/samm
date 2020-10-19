const _ = require('lodash')
const path = require('path')

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
libUtils.isRelativePath = (p) => {
  if (!p || typeof p !== 'string' || p.length === 0) return false
  return !libUtils.isAbsolutePath(p)
}

libUtils.isAbsolutePath = (p) => {
  if (!p || typeof p !== 'string' || p.length === 0) return false
  return path.normalize(p + path.sep) === path.normalize(path.resolve(p) + path.sep)
}

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

module.exports = libUtils
