const { cloneDeep } = require('lodash')
const SymbolTree = require('symbol-tree')
const { SequoiaPathError } = require('./sequoiaPathError.class')
const utils = require('./utils')
const fileUtils = require('./file.utils')

class SequoiaPath {
  constructor (rootPath) {
    this.tree = null /* the real tree */
    this.root = {}

    if (rootPath && !fileUtils.isAbsolutePath(rootPath)) {
      throw new SequoiaPathError(`Tree's root path must be an absolute path: ${rootPath}`)
    }

    this.data = {
      options: utils.getDefaultOptions(),
      rootPath: rootPath,
      filesCount: 0,
      directoriesCount: 0
    }
  }

  /**
   * Set options before using the tree.
   * @param {Object} [options]
   * @param {number} [options.maxLevel]: maximum depth level
   * @param {array<string>} [options.includedExtensions]
   * @param {array<string>} [options.excludedExtensions]
   * @param {array<string>} [options.excludedPaths]
   * @param {function({item:<PathInfo>})} [options.itemFn]
   * @param {function({item:<PathInfo>})} [options.afterDirectoryFn]
   * @param {Class} [options.ObjectClass] - should extend PathInfo
   * @param {string|null} [options.filePath]
   */
  options ({
    maxLevel,
    includedExtensions,
    excludedExtensions,
    excludedPaths,
    itemFn,
    afterDirectoryFn,
    ObjectClass,
    filePath
  }) {
    this.data.options = utils.parseOptions({
      maxLevel,
      includedExtensions,
      excludedExtensions,
      excludedPaths,
      itemFn,
      afterDirectoryFn,
      ObjectClass,
      filePath
    }, this.data.options)
  }

  /**
   * True if tree is not see or it has no nodes.
   * @returns {boolean}
   */
  get empty () {
    return this.tree == null || this.nodeCount === 0
  }

  /**
   * Get the absolute path of the tree's root node.
   * @returns {*}
   */
  get rootPath () {
    return this.data.rootPath
  }

  /**
   * Total number of files and directories in the tree.
   * @returns {number}
   */
  get nodeCount () {
    return this.data.filesCount + this.data.directoriesCount
  }

  /**
   * Total number of files in the tree.
   * @returns {number}
   */
  get fileCount () {
    return this.data.filesCount
  }

  /**
   * Total number of directories in the tree.
   * @returns {number}
   */
  get directoryCount () {
    return this.data.directoriesCount
  }

  /**
   * Reset the internal data: empty tree, no files, no directories.
   */
  reset () {
    this.tree = null
    this.root = {}
    this.data.filesCount = 0
    this.data.directoriesCount = 0
  }

  /**
   * Reset and clean all data and files related to this object.
   * Return true if index file is removed successfully, otherwise an Error object
   * @returns {Promise<boolean|Error>}
   */
  async clean () {
    this.reset()
    const { filePath } = this.data.options
    if (!filePath) return true
    try {
      await fileUtils.removeFile(filePath)
      return true
    } catch (error) {
      return error
    }
  }

  /**
   * Read the root directory and create the tree.
   * Returns the opposite value of this.empty getter in order to check the tree immediately.
   * @param {function(item:<PathInfo>)} filterFn: if present, it should return true to add the item to the tree
   * @returns {Promise<boolean>}
   */
  async read ({ filterFn = null } = {}) {
    this.reset()
    const { rootPath } = this.data

    if (!rootPath || await fileUtils.directoryExists(rootPath) !== true) {
      throw new SequoiaPathError(`Tree's root path does not exist: ${rootPath}`)
    }

    const tree = new SymbolTree()
    let tParent = this.root

    const { maxLevel, includedExtensions, excludedExtensions, excludedPaths, ObjectClass } = this.data.options
    const { itemFn: defaultItemFn, afterDirectoryFn: defaultAfterDirectoryFn } = this.data.options

    await utils.walkDirectory(rootPath, {
      maxLevel,
      includedExtensions,
      excludedExtensions,
      excludedPaths,
      ObjectClass,
      itemFn: (data) => {
        // callback for each item
        if (filterFn && filterFn(data.item) !== true) return
        if (data.item.isFile === true) {
          tree.appendChild(tParent, data.item)
          this.data.filesCount++
        } else if (data.item.isDirectory === true) {
          tParent = tree.appendChild(tParent, data.item)
          this.data.directoriesCount++
        }
        defaultItemFn(data)
      },
      afterDirectoryFn: (data) => {
        // callback after reading directory
        tParent = tree.parent(data.item)
        defaultAfterDirectoryFn(data)
      }
    })

    if (tree.childrenCount(this.root) > 0) {
      this.tree = tree
    }

    return !this.empty
  }

  /**
   * Loads tree structure from file.
   * Returns false if, for some reason, it is not possible to read or get data from file or file has no data.
   * @returns {Promise<boolean>}
   */
  async load () {
    const { filePath } = this.data.options
    if (!filePath) {
      throw new SequoiaPathError('No file associated to this tree (see options.filePath)')
    }
    this.reset()
    if (await fileUtils.fileExists(filePath) !== true) return false
    const jsonData = await fileUtils.readJsonFile(filePath)
    if (!jsonData) return false
    return this.fromJson(jsonData)
  }

  /**
   * Save the data in a json file.
   * Return false if, for some reason, it is not possible to write data on file.
   * @returns {Promise<boolean>}
   */
  async save () {
    const { filePath } = this.data.options
    if (!filePath) {
      throw new SequoiaPathError('No file associated to this tree')
    }
    const jsonData = this.toJson()
    if (!jsonData) {
      this.clean()
      return false
    }
    return !!(await fileUtils.writeJsonFile(filePath, jsonData))
  }

  /**
   * Walk inside the tree nodes
   * @param {boolean} [skipEmpty]: skip empty directories
   * @param {function({item, parent, isFirstChild, isLastChild })} itemFn
   */
  walk ({ skipEmpty = false, itemFn }) {
    if (!this.tree || !this.root) return
    let parent = this.tree.firstChild(this.root)
    if (!parent) return

    let isFirstChild = false; let isLastChild = false
    const iterator = this.tree.treeIterator(parent, {})
    let prevLevel = 0

    for (const item of iterator) {
      if (skipEmpty === true && item.isDirectory && item.size < 1) {
        itemFn({
          item,
          parent,
          isFirstChild,
          isLastChild: true
        })
        continue
      }

      if (prevLevel !== item.level) {
        parent = this.tree.parent(item)
        prevLevel = item.level
      }

      isFirstChild = (this.tree.firstChild(parent) === item)
      isLastChild = (this.tree.lastChild(parent) === item)
      itemFn({
        item,
        parent,
        isFirstChild,
        isLastChild
      })
    }
  }

  /**
   * Simple loop on tree nodes.
   * @param {function({item:<PathInfo>})} itemFn
   */
  forEach ({ itemFn }) {
    if (!this.tree || !this.root) return
    const iterator = this.tree.treeIterator(this.root, {})
    const { ObjectClass } = this.data.options
    for (const item of iterator) {
      if (!(item instanceof ObjectClass)) continue
      itemFn({ item })
    }
  }

  /**
   * Export the tree as json data.
   * @returns {object}
   */
  toJson () {
    if (!this.tree || !this.root || this.empty === true) return null
    const jsonData = {}
    jsonData.data = JSON.parse(JSON.stringify(this.data))
    jsonData.struct = []
    this.walk({
      itemFn: ({ item, isFirstChild, isLastChild }) => {
        jsonData.struct.push({
          item: item.toJson(),
          isFirstChild,
          isLastChild
        })
      }
    })
    return jsonData
  }

  /**
   * Import the tree from json data.
   * @param {object} jsonData
   */
  fromJson (jsonData) {
    if (!jsonData || !jsonData.data || !jsonData.data.options || !jsonData.struct) return false
    this.reset()
    const tree = new SymbolTree()
    let tParent = this.root
    this.data.options.includedExtensions = cloneDeep(jsonData.data.options.includedExtensions)
    this.data.options.excludedExtensions = cloneDeep(jsonData.data.options.excludedExtensions)
    this.data.options.excludedPaths = cloneDeep(jsonData.data.options.excludedPaths)
    this.data.rootPath = jsonData.data.rootPath
    this.data.filesCount = jsonData.data.filesCount
    this.data.directoriesCount = jsonData.data.directoriesCount

    let prevLevel = 1
    let latestItem = null
    let pathInfoObj = null

    for (let i = 0; i < jsonData.struct.length; i++) {
      pathInfoObj = new this.data.options.ObjectClass()
      pathInfoObj.fromJson(jsonData.struct[i].item)

      if (pathInfoObj.level > prevLevel) {
        tParent = latestItem
      } else if (pathInfoObj.level < prevLevel) {
        for (let j = pathInfoObj.level; j < prevLevel; j++) tParent = tree.parent(tParent)
      }
      prevLevel = pathInfoObj.level
      latestItem = tree.appendChild(tParent, pathInfoObj)
    }
    this.tree = tree
    return true
  }

  /**
   * Compare two SequoiaPath objects.
   * @param {SequoiaPath} sqTree
   * @returns {boolean}
   */
  isEqualTo (sqTree) {
    if (!sqTree || !sqTree.tree || !sqTree.root) return false
    if (!this.tree || !this.root) return false
    const treeA = this.tree
    const treeB = sqTree.tree

    let item1, item2
    const iterator1 = treeA.treeIterator(this.root, {})
    const iterator2 = treeB.treeIterator(sqTree.root, {})
    iterator1.next() // discard the empty root
    iterator2.next() // discard the empty root
    item1 = iterator1.next()
    item2 = iterator2.next()

    let flag = true
    while (item1.done === false && item2.done === false) {
      item1 = item1.value
      item2 = item2.value
      flag = item1.isEqualTo(item2)
      if (!flag) return false
      item1 = iterator1.next()
      item2 = iterator2.next()
    }
    flag = (item1.done === item2.done)
    return flag
  }

  /**
   * Print the directory tree.
   * @param {boolean} skipFiles: avoid printing files
   * @param {boolean} skipEmpty: skip empty directories
   * @param {function(...<string>)} printFn: print strings (default console.log)
   * @param {function(object)} itemFn: manage the single node (with props like item, isLastChild, isFirstChild, etc.)
   */
  print ({ skipFiles = false, skipEmpty = true, printFn = console.log, itemFn } = {}) {
    if (!this.tree || !this.root) return false
    if (!itemFn) {
      itemFn = function (node) {
        if (skipFiles === true && node.item.isFile === true) return
        printFn(setBranchPrefix(node) + node.item.base + (node.item.isDirectory ? '/' : ''))
      }
    }

    let branchPrefix = ''
    const defaultBranchPrefix = '|    '
    let prevLevel = 0

    const setBranchPrefix = function (node) {
      branchPrefix = utils.stringReplaceAll(branchPrefix, '\u2514', ' ')
      branchPrefix = utils.stringReplaceAll(branchPrefix, '\u251C', '\u2502')
      branchPrefix = utils.stringReplaceAll(branchPrefix, '\u2500', ' ')

      if (node.item.level < 1) return ''
      let _level = node.item.level
      if (_level <= 1) return ''

      _level -= 2
      if (branchPrefix.length < (5 * (_level + 1))) branchPrefix += defaultBranchPrefix
      if (branchPrefix.length > (5 * (_level + 1))) branchPrefix = branchPrefix.substr(0, branchPrefix.length - 5 * (prevLevel - _level))

      if (node.isLastChild === true) {
        // unique + last
        branchPrefix = utils.stringReplaceAt(branchPrefix, _level * 5, '\u2514')
      } else {
        // first + between
        branchPrefix = utils.stringReplaceAt(branchPrefix, _level * 5, '\u251C')
      }
      branchPrefix = utils.stringReplaceAt(branchPrefix, _level * 5 + 1, '\u2500\u2500')

      prevLevel = _level
      return branchPrefix
    }
    this.walk({
      skipEmpty,
      itemFn
    })

    printFn('\n Root path:', this.rootPath)
    printFn('\n Directories#:', this.directoryCount)
    printFn('\n Files#:', this.fileCount)
    if (this.data.options.includedExtensions.length > 0) {
      printFn('\n Included libs:', this.data.options.includedExtensions.join(', '))
    }
    if (this.data.options.excludedExtensions.length > 0) {
      printFn('\n Excluded libs:', this.data.excludedExtensions.join(', '))
    }
    if (this.data.options.excludedPaths.length > 0) {
      printFn('\n Excluded paths:')
      this.data.options.excludedPaths.forEach(function (v) {
        printFn('  - ', v)
      })
    }
  }
}

module.exports = {
  SequoiaPath
}
