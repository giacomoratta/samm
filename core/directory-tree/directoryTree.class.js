const _ = require('lodash')
const SymbolTree = require('symbol-tree')
const PathInfo = require('./pathInfo.class')
const utils = require('./utils')

class DirectoryTree {
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

  // error () {
  //   return this.tree == null
  // }

  reset () {
    this.tree = null /* Directory Tree */
    this.root = {} // empty rootrootrootroot
    this.data.filesCount = 0
    this.data.directoriesCount = 0
  }

  read (options) {
    options = {
      fileAcceptabilityFn: function (/* {pathInfo} item */) { return true },
      ...options
    }

    this.reset()
    const tree = new SymbolTree()
    let tParent = this.root

    utils.walkDirectory(this.data.rootPath, {
      maxLevel: this.data.options.maxLevel,
      includedExtensions: this.data.options.includedExtensions,
      excludedExtensions: this.data.options.excludedExtensions,
      excludedPaths: this.data.options.excludedPaths,
      itemCb: (data) => {
        // callback for each item
        if (data.item.isFile === true && options.fileAcceptabilityFn(data.item) === true) {
          tree.appendChild(tParent, data.item)
          this.data.filesCount++
        } else if (data.item.isDirectory === true) {
          tParent = tree.appendChild(tParent, data.item)
          this.data.directoriesCount++
        }
        this.data.options.itemCb(data)
      },
      afterDirectoryCb: (data) => {
        // callback after reading directory
        tParent = tree.parent(data.item)
        this.data.options.afterDirectoryCb(data)
      }
    })

    if (tree.childrenCount(this.root) > 0) {
      this.tree = tree
    }
  }

  walk (options) {
    if (!this.tree || !this.root) return
    const tree = this.tree
    let tParent = tree.firstChild(this.root)
    if (!tParent) return

    options = {
      skipEmpty: false,
      itemCb: function () {},
      ...options
    }

    let isFirstChild, isLastChild
    const iterator = tree.treeIterator(tParent, {})
    let prevLevel = 0

    for (const item of iterator) {
      if (options.skipEmpty === true && item.isDirectory && item.size < 1) {
        options.itemCb({
          item: item,
          parent: tParent,
          isFirstChild: isFirstChild,
          isLastChild: true /* also works with isLastChild */
        })
        continue
      }

      if (prevLevel !== item.level) {
        tParent = tree.parent(item)
        prevLevel = item.level
      }

      isFirstChild = (tree.firstChild(tParent) === item)
      isLastChild = (tree.lastChild(tParent) === item)

      options.itemCb({
        item: item,
        parent: tParent,
        isFirstChild: isFirstChild,
        isLastChild: isLastChild
      })
    }
  }

  forEach (options) {
    if (!this.tree || !this.root) return
    const tree = this.tree

    options = {
      itemCb: function () {},
      ...options
    }

    // dT1.print()
    const iterator = tree.treeIterator(this.root, {})
    for (const item of iterator) {
      if(!(item instanceof PathInfo)) continue
      // console.log(level,' - ',isFirstChild,isLastChild,tree.index(item),item.path);
      options.itemCb({
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
    // exportObj.tree =  this.tree;
    // exportObj.root =  this.root;
    exportObj.data = _.cloneDeep(this.data)
    exportObj.struct = []
    this.walk({
      itemCb: (itemData) => {
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

    this.data.options.includedExtensions = importObj.data.options.includedExtensions
    this.data.options.excludedExtensions = importObj.data.options.excludedExtensions
    this.data.options.excludedPaths = importObj.data.options.excludedPaths
    this.data.rootPath = importObj.data.rootPath
    this.data.filesCount = importObj.data.filesCount
    this.data.directoriesCount = importObj.data.directoriesCount

    let prevLevel = 1
    let latestItem
    let newPathInfo = null

    for (let i = 0; i < importObj.struct.length; i++) {
      newPathInfo = new PathInfo()
      newPathInfo.fromJson(importObj.struct[i].item)
      // console.log(itemData.item);

      if (newPathInfo.level === prevLevel) {
        // console.log(_.padStart(' ',itemData.level*3),tParent.name,' # ',newPathInfo.base,' = same level',itemData.level,prevLevel);

      } else if (newPathInfo.level > prevLevel) {
        tParent = latestItem
        // console.log(_.padStart(' ',itemData.level*3),tParent.name,' # ',newPathInfo.base,' > previous',itemData.level,prevLevel);
      } else {
        for (let j = newPathInfo.level; j < prevLevel; j++) tParent = tree.parent(tParent)
        // console.log(_.padStart(' ',itemData.level*3),tParent.name,' # ',newPathInfo.base,' < previous',itemData.level,prevLevel);
        // console.log(_.padStart(' ',itemData.level*3),'>> ',tParent.base);
      }
      prevLevel = newPathInfo.level
      // console.log(latestItem,tParent,newPathInfo);
      latestItem = tree.appendChild(tParent, newPathInfo)
      // console.log(latestItem);
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
      skip_files: false,
      skipEmpty: true,
      printFn: console.log,
      ...options
    }
    if (!options.itemCb) {
      options.itemCb = function (data) {
        if (data.item.isFile) return
        options.printFn(preFn(data) + data.item.base + (data.item.isDirectory ? '/' : '')) //, data.item.level, data.isFirstChild, data.isLastChild);
      }
    }

    let ppre = ''
    const def1 = '|    '
    let prevLevel = 0

    const preFn = function (data) {
      ppre = utils.stringReplaceAll(ppre, '\u2514', ' ')
      ppre = utils.stringReplaceAll(ppre, '\u251C', '\u2502')
      ppre = utils.stringReplaceAll(ppre, '\u2500', ' ')

      if (data.item.level < 1) return ''
      let _level = data.item.level
      if (_level <= 1) return ''

      _level -= 2
      if (ppre.length < (5 * (_level + 1))) ppre += def1
      if (ppre.length > (5 * (_level + 1))) ppre = ppre.substr(0, ppre.length - 5 * (prevLevel - _level))

      if (data.isLastChild === true) {
        // unique + last
        ppre = utils.stringReplaceAt(ppre, _level * 5, '\u2514')
      } else {
        // first + between
        ppre = utils.stringReplaceAt(ppre, _level * 5, '\u251C')
      }
      ppre = utils.stringReplaceAt(ppre, _level * 5 + 1, '\u2500\u2500')

      prevLevel = _level
      return ppre
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

module.exports = DirectoryTree
