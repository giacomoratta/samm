const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const { PathInfo } = require('../path-info/pathInfo.class')

const parseOptions = function (options) {
  options = {
    maxLevel: 0,
    includedExtensions: [],
    excludedExtensions: [],
    excludedPaths: [],
    itemFn: function ({ item }) {},
    afterDirectoryFn: function ({ item }) {},
    ...options
  }
  return options
}

const prepareExcludedPaths = function (excludedPaths) {
  // /some_path_to_exclude (no final path.sep)
  if (!_.isArray(excludedPaths) || excludedPaths.length === 0) return null
  const exclArray = []
  excludedPaths.forEach(function (v) {
    // if(v.endsWith(path.sep)) v=v.slice(0,-1)
    exclArray.push(new RegExp(`(${_.escapeRegExp(v)})$`, 'i'))
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

const walkAction = async function (rootPath, absPath, options) {
  if (options.excludedPaths && options.excludedPaths.some((e) => e.test(absPath))) return null

  const pInfo = new PathInfo(absPath)
  if (!pInfo.isFile && !pInfo.isDirectory) return
  pInfo.relRoot = rootPath /* set relative root, relative path and level */

  if (pInfo.isFile) {
    if (options.includedExtensionsRegex) {
      /* Check included extensions (final tree will have these file only) */
      if (!options.includedExtensionsRegex.test(_.toLower((pInfo.ext.length > 1 ? pInfo.ext : pInfo.name)))) { return null }
    } else if (options.excludedExtensionsRegex) {
      /* Check excluded extensions */
      if (options.excludedExtensionsRegex.test(_.toLower((pInfo.ext.length > 1 ? pInfo.ext : pInfo.name)))) return null
    }
    await options.itemFn({ item: pInfo })
    return pInfo
  } else if (pInfo.isDirectory) {
    await options.itemFn({ item: pInfo })

    await readDirectory(absPath, sortFilesArray, async (item) => {
      item = path.join(absPath, item)

      if (options.maxLevel > 0 && options.maxLevel <= pInfo.level) return

      const pi = await walkAction(rootPath, item, options)
      if (!pi) return
      if (pi.size) pInfo.size += pi.size
    })

    await options.afterDirectoryFn({ item: pInfo })
    return pInfo
  }
}

const walkDirectory = async function (absPath, options) {
  options = parseOptions(options)
  absPath = path.resolve(absPath) // + path.sep
  options.excludedPaths = prepareExcludedPaths(options.excludedPaths)
  options.includedExtensionsRegex = prepareExtensionsRegex(options.includedExtensions)
  options.excludedExtensionsRegex = prepareExtensionsRegex(options.excludedExtensions)
  await walkAction(absPath, absPath, options)
}

const stringReplaceAt = function (str, index, replacement) {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length)
}

const stringReplaceAll = function (str, search, replacement) {
  return str.replace(new RegExp(search, 'g'), replacement)
}

const sortFilesArray = function (array) {
  array.sort(function (a, b) {
    const aName = _.toLower(a)
    const bName = _.toLower(b)
    if (aName < bName) return -1
    if (aName > bName) return 1
    return 0
  })
  return array
}

const readDirectory = async function (pathString, preProcessItemsFn, itemFn) {
  return new Promise((resolve) => {
    if (!itemFn) itemFn = async function () {}
    if (!preProcessItemsFn) preProcessItemsFn = function () {}
    fs.readdir(pathString, async (err, items) => {
      if (err || !items) {
        resolve(null)
        return
      }
      preProcessItemsFn(items)
      for (let i = 0; i < items.length; i++) {
        await itemFn(items[i], i, items)
      }
      resolve(items)
    })
  })
}

module.exports = {
  parseOptions,
  walkDirectory,
  stringReplaceAt,
  stringReplaceAll
}
