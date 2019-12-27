const path = require('path')
const utils = require('../utils')

function walkDirectory (options) {
  const absPath = path.join(__dirname, 'test_dir')
  let simpleTree = { parent: null, children: [] }
  const simpleArray = []
  let currentNode = simpleTree

  options = {
    ...options,
    itemFn: ({ item }) => {
      if (item.isFile) {
        const newNode = { item, parent: currentNode }
        currentNode.children.push(newNode)
        simpleArray.push(newNode)
      } else if (item.isDirectory) {
        const newNode = { item, children: [], parent: currentNode }
        currentNode.children.push(newNode)
        simpleArray.push(newNode)
        currentNode = newNode
      }
    },
    afterDirectoryFn: ({ item }) => {
      currentNode = currentNode.parent
    }
  }
  utils.walkDirectory(absPath, options)
  simpleTree = simpleTree.children[0]
  simpleTree.parent = null
  return { simpleTree, simpleArray }
}

describe('Static utils for DirectoryTree', function () {
  it('should parse options correctly', function () {
    const options = {
      maxLevel: 5,
      includedExtensions: ['inc1', 'inc2', 'inc3'],
      excludedExtensions: ['exc1', 'exc2', 'exc3'],
      excludedPaths: ['excP1', 'excP2', 'excP3']
      // itemFn: function () {},
      // afterDirectoryFn: function () {}
    }
    const options2 = utils.parseOptions(options)

    options.includedExtensions = ['modInc1']
    options.maxLevel = 7
    options.itemFn = 'abc'

    expect(function () {
      options2.afterDirectoryFn()
    }).toThrow()
    expect(function () {
      options2.afterDirectoryFn({})
    }).not.toThrow()

    expect(options.maxLevel).toEqual(7)
    expect(options2.maxLevel).toEqual(5)
    expect(options.itemFn).toEqual('abc')
    expect(options.includedExtensions).toMatchObject(['modInc1'])
    expect(options2.includedExtensions).toMatchObject(['inc1', 'inc2', 'inc3'])
    expect(typeof options.itemFn === 'string').toEqual(true)
    expect(typeof options2.itemFn === 'function').toEqual(true)
  })

  it('should walk a directory correctly and return an ordered array', function () {
    const { simpleArray } = walkDirectory()

    expect(simpleArray.length).toEqual(18)

    let i = 0
    expect(simpleArray[i].item.base).toEqual('test_dir')
    expect(simpleArray[i].item.relPath).toEqual('')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(simpleArray[i].item.level).toEqual(1)
    expect(simpleArray[i].item.ext).toEqual('')
    expect(simpleArray[i].item.isDirectory).toEqual(true)
    expect(simpleArray[i].item.isFile).toEqual(false)

    i++
    expect(simpleArray[i].item.base).toEqual('directory1')
    expect(simpleArray[i].item.relPath).toEqual('directory1')
    expect(simpleArray[i].item.level).toEqual(2)
    expect(simpleArray[i].item.isDirectory).toEqual(true)
    expect(simpleArray[i].item.isFile).toEqual(false)

    i++
    expect(simpleArray[i].item.base).toEqual('directory2')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'directory2'))
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.ext).toEqual('')
    expect(simpleArray[i].item.isDirectory).toEqual(true)
    expect(simpleArray[i].item.isFile).toEqual(false)

    i++
    expect(simpleArray[i].item.base).toEqual('file22.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'directory2', 'file22.txt'))
    expect(simpleArray[i].item.level).toEqual(4)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file26.json')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'directory2', 'file26.json'))
    expect(simpleArray[i].item.level).toEqual(4)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('directory3')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'directory3'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.isDirectory).toEqual(true)
    expect(simpleArray[i].item.isFile).toEqual(false)

    i++
    expect(simpleArray[i].item.base).toEqual('file33.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'directory3', 'file33.txt'))
    expect(simpleArray[i].item.level).toEqual(4)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file35.txt')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'directory3', 'file35.txt'))
    expect(simpleArray[i].item.level).toEqual(4)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file11.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'file11.txt'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.ext).toEqual('txt')
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file14.json')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'file14.json'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file18.wav')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1', 'file18.wav'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.ext).toEqual('wav')
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('directory6')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(simpleArray[i].item.relPath).toEqual('directory6')
    expect(simpleArray[i].item.level).toEqual(2)
    expect(simpleArray[i].item.isDirectory).toEqual(true)
    expect(simpleArray[i].item.isFile).toEqual(false)

    i++
    expect(simpleArray[i].item.base).toEqual('file61.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory6', 'file61.txt'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file64.json')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory6', 'file64.json'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.ext).toEqual('json')
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file68.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory6', 'file68.txt'))
    expect(simpleArray[i].item.level).toEqual(3)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('file1.txt')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(simpleArray[i].item.relPath).toEqual('file1.txt')
    expect(simpleArray[i].item.level).toEqual(2)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('my_file1.json')
    expect(simpleArray[i].item.relPath).toEqual('my_file1.json')
    expect(simpleArray[i].item.level).toEqual(2)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)

    i++
    expect(simpleArray[i].item.base).toEqual('my_file2.json')
    expect(simpleArray[i].item.relPath).toEqual('my_file2.json')
    expect(simpleArray[i].item.level).toEqual(2)
    expect(simpleArray[i].item.isDirectory).toEqual(false)
    expect(simpleArray[i].item.isFile).toEqual(true)
  })

  it('should walk a directory correctly and return a simple tree', function () {
    const { simpleTree, simpleArray } = walkDirectory()
    expect(simpleArray.length).toEqual(18)

    expect(simpleTree.parent).toEqual(null)
    expect(simpleTree.children.length).toEqual(5)
    expect(simpleTree.item.base).toEqual('test_dir')
    expect(simpleTree.item.relPath).toEqual('')
    expect(simpleTree.item.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(simpleTree.item.level).toEqual(1)
    expect(simpleTree.item.ext).toEqual('')
    expect(simpleTree.item.isDirectory).toEqual(true)
    expect(simpleTree.item.isFile).toEqual(false)

    expect(simpleTree.children[0].item.base).toEqual('directory1')
    expect(simpleTree.children[0].item.relPath).toEqual('directory1')
    expect(simpleTree.children[0].item.level).toEqual(2)
    expect(simpleTree.children[0].item.isDirectory).toEqual(true)
    expect(simpleTree.children[0].item.isFile).toEqual(false)
    expect(simpleTree.children[0].parent.children.length).toEqual(5)
    expect(simpleTree.children[0].parent.item.base).toEqual('test_dir')
    expect(simpleTree.children[0].parent.item.relPath).toEqual('')
    expect(simpleTree.children[0].parent.item.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(simpleTree.children[0].parent.item.level).toEqual(1)
    expect(simpleTree.children[0].parent.item.ext).toEqual('')
    expect(simpleTree.children[0].parent.item.isDirectory).toEqual(true)
    expect(simpleTree.children[0].parent.item.isFile).toEqual(false)

    expect(simpleTree.children[4].item.base).toEqual('my_file2.json')
    expect(simpleTree.children[4].item.relPath).toEqual('my_file2.json')
    expect(simpleTree.children[4].item.level).toEqual(2)
    expect(simpleTree.children[4].item.isDirectory).toEqual(false)
    expect(simpleTree.children[4].item.isFile).toEqual(true)

    expect(simpleTree.children[0].children[1].children[0].item.base).toEqual('file33.txt')
    expect(simpleTree.children[0].children[1].children[0].item.relPath).toEqual(path.join('directory1', 'directory3', 'file33.txt'))
    expect(simpleTree.children[0].children[1].children[0].item.level).toEqual(4)
    expect(simpleTree.children[0].children[1].children[0].item.isDirectory).toEqual(false)
    expect(simpleTree.children[0].children[1].children[0].item.isFile).toEqual(true)
  })
})
