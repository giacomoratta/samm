const path = require('path')
const _ = require('../utils/lodash.extended')
const fileUtils = require('../utils/file.utils')
const arrayUtils = require('../utils/array.utils')
const PathInfo = require('./pathInfo.class')

const parseOptions = (options) => {
  options = {
    maxLevel: 0,
    includedExtensions: [],
    excludedExtensions: [],
    excludedPaths: [],
    itemCb: function () {},
    afterDirectoryCb: function () {},
    ...options
  }
  return options
}

const prepareExcludedPaths = function (excludedPaths) {
  // /some_path_to_exclude/
  if (!_.isArray(excludedPaths) || excludedPaths.length === 0) return null
  const exclArray = []
  excludedPaths.forEach(function (v) {
    exclArray.push(_.escapeRegExp(v))
  })
  if (excludedPaths.length === 0) return null
  return exclArray
}

const prepareIncludedExtensions = function (includedExtensions) {
  // .*(sh|ini|jpg|vhost|xml|png)$  or  /\.txt$/
  if (!_.isArray(includedExtensions) || includedExtensions.length === 0) return null
  const _nw = []
  includedExtensions.forEach(function (v) {
    _nw.push(_.escapeRegExp(v))
  })
  return new RegExp('^\\.?(' + _.join(_nw, '|') + ')$', 'i')
}

const prepareExcludedExtensions = prepareIncludedExtensions

const walkAction = function (rootPath, absPath, options) {
  if (options.excludedPaths && options.excludedPaths.some((e) => e.test(absPath))) return null

  const pInfo = new PathInfo(absPath)
  if (pInfo.error === true || (!pInfo.isFile && !pInfo.isDirectory)) return
  pInfo.rel_root = path.sep // rootPathUtils.File.pathSeparator

  if (pInfo.isFile) {
    if (options.includedExtensionsRegex) { /* included libs have the priority */
      if (!options.includedExtensionsRegex.test(_.toLower((pInfo.ext.length > 1 ? pInfo.ext : pInfo.name)))) return null
    } else if (options.excludedExtensionsRegex && options.excludedExtensionsRegex.test(_.toLower((pInfo.ext.length > 1 ? pInfo.ext : pInfo.name)))) return null

    options.itemCb({ item: pInfo })
    return pInfo
  } else if (pInfo.isDirectory) {
    options.itemCb({ item: pInfo })

    fileUtils.readDirectorySync(absPath, (a) => {
      arrayUtils.sortFilesArray(a)
    }, (v, i, a) => {
      v = path.join(absPath, v)

      if (options.maxLevel > 0 && options.maxLevel <= pInfo.level) return

      const pi = walkAction(rootPath, v, options)
      if (!pi) return
      if (pi.size) pInfo.size += pi.size
    })

    options.afterDirectoryCb({ item: pInfo })
    return pInfo
  }
}

const walkDirectory = (absPath, options) => {
  options = parseOptions(options)
  absPath = path.resolve(absPath) + path.sep
  options.excludedPaths = prepareExcludedPaths(options.excludedPaths)
  options.includedExtensionsRegex = prepareIncludedExtensions(options.includedExtensions)
  options.excludedExtensionsRegex = prepareExcludedExtensions(options.excludedExtensions)
  walkAction(absPath, absPath, options)
}

module.exports = {
  parseOptions,
  walkDirectory
}
