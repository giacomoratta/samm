const path = require('path')
const utils = require('../utils')

function walkDirectory(options) {
  const absPath = path.join(__dirname,'test_dir')
  const simpleTree = { parent: null, children:[] }
  const simpleArray = []
  let currentNode = simpleTree

  options = {
    ...options,
    itemCb: ({ item }) => {
      if(item.isFile) {
        const newNode = { item, parent: currentNode }
        currentNode.children.push(newNode)
        simpleArray.push(newNode)
      } else if(item.isDirectory) {
        const newNode = { item, children: [], parent: currentNode }
        currentNode.children.push(newNode)
        simpleArray.push(newNode)
        currentNode = newNode
      }
    },
    afterDirectoryCb: ({ item }) => {
      currentNode = currentNode.parent
    }
  }
  utils.walkDirectory(absPath,options)
  return { simpleTree, simpleArray }
}

describe('Static utils for DirectoryTree', function () {
  it('should parse options correctly', function () {
    const options = {
      maxLevel: 5,
      includedExtensions: ['inc1', 'inc2', 'inc3'],
      excludedExtensions: ['exc1', 'exc2', 'exc3'],
      excludedPaths: ['excP1', 'excP2', 'excP3']
      // itemCb: function () {},
      // afterDirectoryCb: function () {}
    }
    const options2 = utils.parseOptions(options)

    options.includedExtensions = ['modInc1']
    options.maxLevel = 7
    options.itemCb = 'abc'

    expect(function () {
      options2.afterDirectoryCb()
    }).toThrow()
    expect(function () {
      options2.afterDirectoryCb({})
    }).not.toThrow()

    expect(options.maxLevel).toEqual(7)
    expect(options2.maxLevel).toEqual(5)
    expect(options.itemCb).toEqual('abc')
    expect(options.includedExtensions).toMatchObject(['modInc1'])
    expect(options2.includedExtensions).toMatchObject(['inc1', 'inc2', 'inc3'])
    expect(typeof options.itemCb === 'string').toEqual(true)
    expect(typeof options2.itemCb === 'function').toEqual(true)
  })

  it('should walk a directory correctly', function () {
    const { simpleTree, simpleArray } = walkDirectory()

    expect(simpleArray.length).toEqual(18)

    let i=0
    expect(simpleArray[i].item.base).toEqual('test_dir')
    expect(simpleArray[i].item.relPath).toEqual('')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname,'test_dir'))
    expect(simpleArray[i].item.level).toEqual(1)

    i++
    expect(simpleArray[i].item.base).toEqual('directory1')
    expect(simpleArray[i].item.relPath).toEqual('directory1')
    expect(simpleArray[i].item.level).toEqual(2)

    i++
    expect(simpleArray[i].item.base).toEqual('directory2')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','directory2'))
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname,'test_dir'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('file22.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','directory2','file22.txt'))
    expect(simpleArray[i].item.level).toEqual(4)

    i++
    expect(simpleArray[i].item.base).toEqual('file26.json')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','directory2','file26.json'))
    expect(simpleArray[i].item.level).toEqual(4)

    i++
    expect(simpleArray[i].item.base).toEqual('directory3')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','directory3'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('file33.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','directory3','file33.txt'))
    expect(simpleArray[i].item.level).toEqual(4)

    i++
    expect(simpleArray[i].item.base).toEqual('file35.txt')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname,'test_dir'))
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','directory3','file35.txt'))
    expect(simpleArray[i].item.level).toEqual(4)

    i++
    expect(simpleArray[i].item.base).toEqual('file11.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','file11.txt'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('file14.json')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','file14.json'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('file18.wav')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory1','file18.wav'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('directory6')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname,'test_dir'))
    expect(simpleArray[i].item.relPath).toEqual('directory6')
    expect(simpleArray[i].item.level).toEqual(2)

    i++
    expect(simpleArray[i].item.base).toEqual('file61.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory6','file61.txt'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('file64.json')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory6','file64.json'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('file68.txt')
    expect(simpleArray[i].item.relPath).toEqual(path.join('directory6','file68.txt'))
    expect(simpleArray[i].item.level).toEqual(3)

    i++
    expect(simpleArray[i].item.base).toEqual('file1.txt')
    expect(simpleArray[i].item.relRoot).toEqual(path.join(__dirname,'test_dir'))
    expect(simpleArray[i].item.relPath).toEqual('file1.txt')
    expect(simpleArray[i].item.level).toEqual(2)

    i++
    expect(simpleArray[i].item.base).toEqual('my_file1.json')
    expect(simpleArray[i].item.relPath).toEqual('my_file1.json')
    expect(simpleArray[i].item.level).toEqual(2)

    i++
    expect(simpleArray[i].item.base).toEqual('my_file2.json')
    expect(simpleArray[i].item.relPath).toEqual('my_file2.json')
    expect(simpleArray[i].item.level).toEqual(2)


    return
    simpleArray.forEach((x) => {
      console.log(x.item)
    })

  })
})
