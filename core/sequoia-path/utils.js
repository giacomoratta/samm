const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const fileUtils = require('./file.utils')
const { PathInfo } = require('../path-info/pathInfo.class')
const { SequoiaPathError } = require('./sequoiaPathError.class')

const getDefaultOptions = function () {
  return {
    maxLevel: 0,
    includedExtensions: [],
    excludedExtensions: [],
    excludedPaths: [],
    itemFn: function ({ item }) {},
    afterDirectoryFn: function ({ item }) {},
    ObjectClass: PathInfo,
    filePath: null
  }
}

const parseOptions = function (options, defaultOptions) {
  if (!defaultOptions) defaultOptions = getDefaultOptions()
  Object.keys(options).forEach((k) => { if (options[k] === undefined) delete options[k] })
  options = {
    ...defaultOptions,
    ...options
  }

  if (options.ObjectClass && options.ObjectClass !== PathInfo && !(options.ObjectClass instanceof PathInfo)) {
    throw new SequoiaPathError('options.ObjectClass should extend PathInfo class')
  }

  if (options.filePath && !fileUtils.isAbsolutePath(options.filePath)) {
    throw new SequoiaPathError(`filePath must be an absolute path: ${options.filePath}`)
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

const prepareExtensionsRegex = function (extensionsList) {
  // .*(sh|ini|jpg|vhost|xml|png)$  or  /\.txt$/
  if (!_.isArray(extensionsList) || extensionsList.length === 0) return null
  const extList = []
  extensionsList.forEach(function (v) {
    extList.push(_.escapeRegExp(v))
  })
  return new RegExp(`^\\.?(${_.join(extList, '|')})$`, 'i')
}

const walkAction = async function (relRootPath, absolutePath, options) {
  if (options.excludedPaths && options.excludedPaths.some((e) => e.test(absolutePath))) return null

  const pInfo = new options.ObjectClass()
  await pInfo.set({ absolutePath, relRootPath })
  if (!pInfo.isSet() || (!pInfo.isFile && !pInfo.isDirectory)) return null

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

    await readDirectory(absolutePath, sortFilesArray, async (item) => {
      item = path.join(absolutePath, item)

      if (options.maxLevel > 0 && options.maxLevel <= pInfo.level) return null

      const pi = await walkAction(relRootPath, item, options)
      if (pi === null) return null
      if (pi.size) pInfo.size += pi.size
    })

    await options.afterDirectoryFn({ item: pInfo })
    return pInfo
  }
}

const walkDirectory = async function (absolutePath, options) {
  options = parseOptions(options)
  absolutePath = path.resolve(absolutePath)
  options.excludedPaths = prepareExcludedPaths(options.excludedPaths)
  options.includedExtensionsRegex = prepareExtensionsRegex(options.includedExtensions)
  options.excludedExtensionsRegex = prepareExtensionsRegex(options.excludedExtensions)
  await walkAction(absolutePath, absolutePath, options)
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
  getDefaultOptions,
  parseOptions,
  walkDirectory,
  stringReplaceAt,
  stringReplaceAll
}
