const _ = require('lodash')
const SymbolTree = require('symbol-tree')
const utils = require('./utils')

class SequoiaPath {
  constructor (absPath, options) {
    this.tree = null /* the real tree */
    this.root = {}

    this.data = {
      options: utils.parseOptions(options),
      rootPath: absPath,
      filesCount: 0,
      directoriesCount: 0
    }
  }

  reset () {
    this.tree = null
    this.root = {}
    this.data.filesCount = 0
    this.data.directoriesCount = 0
  }

  async read (options) {
    options = {
      filterFn: null,
      ...options
    }

    this.reset()
    const tree = new SymbolTree()
    let tParent = this.root

    await utils.walkDirectory(this.data.rootPath, {
      maxLevel: this.data.options.maxLevel,
      includedExtensions: this.data.options.includedExtensions,
      excludedExtensions: this.data.options.excludedExtensions,
      excludedPaths: this.data.options.excludedPaths,
      ObjectClass: this.data.options.ObjectClass,
      itemFn: (data) => {
        // callback for each item
        if (options.filterFn && options.filterFn(data.item) !== true) return
        if (data.item.isFile === true) {
          tree.appendChild(tParent, data.item)
          this.data.filesCount++
        } else if (data.item.isDirectory === true) {
          tParent = tree.appendChild(tParent, data.item)
          this.data.directoriesCount++
        }
        this.data.options.itemFn(data)
      },
      afterDirectoryFn: (data) => {
        // callback after reading directory
        tParent = tree.parent(data.item)
        this.data.options.afterDirectoryFn(data)
      }
    })

    if (tree.childrenCount(this.root) > 0) {
      this.tree = tree
    }
  }

  walk (options) {
    if (!this.tree || !this.root) return
    let tParent = this.tree.firstChild(this.root)
    if (!tParent) return

    options = {
      skipEmpty: false,
      itemFn: function () {},
      ...options
    }

    let isFirstChild, isLastChild
    const iterator = this.tree.treeIterator(tParent, {})
    let prevLevel = 0

    for (const item of iterator) {
      if (options.skipEmpty === true && item.isDirectory && item.size < 1) {
        options.itemFn({
          item: item,
          parent: tParent,
          isFirstChild: isFirstChild,
          isLastChild: true /* also works with isLastChild */
        })
        continue
      }

      if (prevLevel !== item.level) {
        tParent = this.tree.parent(item)
        prevLevel = item.level
      }

      isFirstChild = (this.tree.firstChild(tParent) === item)
      isLastChild = (this.tree.lastChild(tParent) === item)

      options.itemFn({
        item: item,
        parent: tParent,
        isFirstChild: isFirstChild,
        isLastChild: isLastChild
      })
    }
  }

  forEach (options) {
    if (!this.tree || !this.root) return
    options = {
      itemFn: function () {},
      ...options
    }
    const iterator = this.tree.treeIterator(this.root, {})
    for (const item of iterator) {
      if (!(item instanceof this.data.options.ObjectClass)) continue
      options.itemFn({
        item
      })
    }
  }

  empty () {
    return this.tree == null || this.nodeCount() === 0
  }

  rootPath () {
    return this.data.rootPath
  }

  nodeCount () {
    return this.data.filesCount + this.data.directoriesCount
  }

  fileCount () {
    return this.data.filesCount
  }

  directoryCount () {
    return this.data.directoriesCount
  }

  toJson () {
    const exportObj = {}
    exportObj.data = _.cloneDeep(this.data)
    exportObj.struct = []
    this.walk({
      itemFn: (itemData) => {
        delete itemData.parent
        itemData.item = itemData.item.toJson()
        exportObj.struct.push(itemData)
      }
    })
    return exportObj
  }

  fromJson (importObj) {
    this.reset()
    const tree = new SymbolTree()
    let tParent = this.root
    this.data.options.includedExtensions = _.cloneDeep(importObj.data.options.includedExtensions)
    this.data.options.excludedExtensions = _.cloneDeep(importObj.data.options.excludedExtensions)
    this.data.options.excludedPaths = _.cloneDeep(importObj.data.options.excludedPaths)
    this.data.rootPath = importObj.data.rootPath
    this.data.filesCount = importObj.data.filesCount
    this.data.directoriesCount = importObj.data.directoriesCount

    let prevLevel = 1
    let latestItem
    let newPathInfo = null

    for (let i = 0; i < importObj.struct.length; i++) {
      newPathInfo = new this.data.options.ObjectClass()
      newPathInfo.fromJson(importObj.struct[i].item)

      if (newPathInfo.level > prevLevel) {
        tParent = latestItem
      } else if (newPathInfo.level < prevLevel) {
        for (let j = newPathInfo.level; j < prevLevel; j++) tParent = tree.parent(tParent)
      }
      prevLevel = newPathInfo.level
      latestItem = tree.appendChild(tParent, newPathInfo)
    }
    this.tree = tree
  }

  isEqualTo (tree2) {
    if (!tree2.tree || !tree2.root) return
    if (!this.tree || !this.root) return
    const treeA = this.tree
    const treeB = tree2.tree

    let item1, item2
    const iterator1 = treeA.treeIterator(this.root, {})
    const iterator2 = treeB.treeIterator(tree2.root, {})
    item1 = iterator1.next() // discard the empty root
    item2 = iterator2.next() // discard the empty root
    item1 = iterator1.next()
    item2 = iterator2.next()

    let flag = true
    while (item1.done === false && item2.done === false) {
      item1 = item1.value
      item2 = item2.value
      flag = item1.isEqualTo(item2)
      if (!flag) return null
      item1 = iterator1.next()
      item2 = iterator2.next()
    }
    flag = (item1.done === item2.done)
    return flag
  }

  print (options) {
    options = {
      skipFiles: false,
      skipEmpty: true,
      printFn: console.log,
      ...options
    }
    if (!options.itemFn) {
      options.itemFn = function (data) {
        if (options.skipFiles === true && data.item.isFile === true) return
        options.printFn(setBranchPrefix(data) + data.item.base + (data.item.isDirectory ? '/' : '')) //, data.item.level, data.isFirstChild, data.isLastChild);
      }
    }

    let branchPrefix = ''
    const defaultBranchPrefix = '|    '
    let prevLevel = 0

    const setBranchPrefix = function (data) {
      branchPrefix = utils.stringReplaceAll(branchPrefix, '\u2514', ' ')
      branchPrefix = utils.stringReplaceAll(branchPrefix, '\u251C', '\u2502')
      branchPrefix = utils.stringReplaceAll(branchPrefix, '\u2500', ' ')

      if (data.item.level < 1) return ''
      let _level = data.item.level
      if (_level <= 1) return ''

      _level -= 2
      if (branchPrefix.length < (5 * (_level + 1))) branchPrefix += defaultBranchPrefix
      if (branchPrefix.length > (5 * (_level + 1))) branchPrefix = branchPrefix.substr(0, branchPrefix.length - 5 * (prevLevel - _level))

      if (data.isLastChild === true) {
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
    this.walk(options)

    options.printFn('\n Root path:', this.rootPath())
    options.printFn('\n Directories#:', this.directoryCount())
    options.printFn('\n Files#:', this.fileCount())
    if (this.data.options.includedExtensions.length > 0) {
      options.printFn('\n Included libs:', this.data.options.includedExtensions.join(', '))
    }
    if (this.data.options.excludedExtensions.length > 0) {
      options.printFn('\n Excluded libs:', this.data.options.excludedExtensions.join(', '))
    }
    if (this.data.options.excludedPaths.length > 0) {
      options.printFn('\n Excluded paths:')
      this.data.options.excludedPaths.forEach(function (v) {
        options.printFn('  - ', v)
      })
    }
  }
}

module.exports = {
  SequoiaPath
}
