const path = require('path')

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

module.exports = utils
