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
    itemCb: function ({ item }) {},
    afterDirectoryCb: function ({ item }) {},
    ...options
  }
  return options
}

const prepareExcludedPaths = function (excludedPaths) {
  // /some_path_to_exclude (no final path.sep)
  if (!_.isArray(excludedPaths) || excludedPaths.length === 0) return null
  const exclArray = []
  excludedPaths.forEach(function (v) {
    //if(v.endsWith(path.sep)) v=v.slice(0,-1)
    exclArray.push(new RegExp(`(${_.escapeRegExp(v)})$`,'i'))
  })
  if (exclArray.length === 0) return null
  return exclArray
}

const prepareExtensionsRegex = function (includedExtensions) {
  // .*(sh|ini|jpg|vhost|xml|png)$  or  /\.txt$/
  if (!_.isArray(includedExtensions) || includedExtensions.length === 0) return null
  const extList = []
  includedExtensions.forEach(function (v) {
    extList.push(_.escapeRegExp(v))
  })
  return new RegExp(`^\\.?(${_.join(extList, '|')})$`, 'i')
}

const walkAction = function (rootPath, absPath, options) {
  if (options.excludedPaths && options.excludedPaths.some((e) => e.test(absPath))) return null

  const pInfo = new PathInfo(absPath)
  if (!pInfo.isFile && !pInfo.isDirectory) return
  pInfo.relRoot = rootPath /* set relative root, relative path and level */

  if (pInfo.isFile) {
    /* Check included extensions (final tree will have these file only) */
    if (options.includedExtensionsRegex) {
      if(!options.includedExtensionsRegex.test(_.toLower((pInfo.ext.length > 1 ? pInfo.ext : pInfo.name)))) return null
    }
    /* Check excluded extensions */
    else if (options.excludedExtensionsRegex) {
      if(options.excludedExtensionsRegex.test(_.toLower((pInfo.ext.length > 1 ? pInfo.ext : pInfo.name)))) return null
    }
    options.itemCb({ item: pInfo })
    return pInfo

  } else if (pInfo.isDirectory) {
    options.itemCb({ item: pInfo })

    fileUtils.readDirectorySync(absPath, arrayUtils.sortFilesArray, (item) => {
      item = path.join(absPath, item)

      if (options.maxLevel > 0 && options.maxLevel <= pInfo.level) return

      const pi = walkAction(rootPath, item, options)
      if (!pi) return
      if (pi.size) pInfo.size += pi.size
    })

    options.afterDirectoryCb({ item: pInfo })
    return pInfo
  }
}

const walkDirectory = (absPath, options) => {
  options = parseOptions(options)
  absPath = path.resolve(absPath) //+ path.sep
  options.excludedPaths = prepareExcludedPaths(options.excludedPaths)
  options.includedExtensionsRegex = prepareExtensionsRegex(options.includedExtensions)
  options.excludedExtensionsRegex = prepareExtensionsRegex(options.excludedExtensions)
  walkAction(absPath, absPath, options)
}

const stringReplaceAt = function (str, index, replacement) {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length)
}

const stringReplaceAll = function (str, search, replacement) {
  return str.replace(new RegExp(search, 'g'), replacement)
}

module.exports = {
  parseOptions,
  walkDirectory,
  stringReplaceAt,
  stringReplaceAll
}
