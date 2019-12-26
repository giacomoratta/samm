const path = require('path')
const utils = require('../utils')

function walkDirectory (options) {
  const absPath = path.join(__dirname, 'test_dir')
  let simpleTree = { parent: null, children: [] }
  const simpleArray = []
  let currentNode = simpleTree

  options = {
    ...options,
    itemCb: ({ item }) => {
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
    afterDirectoryCb: ({ item }) => {
      currentNode = currentNode.parent
    }
  }
  utils.walkDirectory(absPath, options)
  simpleTree = simpleTree.children[0]
  simpleTree.parent = null
  return { simpleTree, simpleArray }
}

function printSimpleTree ({ simpleTree, indent = 0 }) {
  const preString = ('   ').repeat(indent)
  indent++
  if (!simpleTree.children) return
  simpleTree.children.forEach((e) => {
    console.log(preString, e.item.base, '  L:', e.item.level)
    console.log(preString, e.item.relPath)
    // console.log(preString,e.item.relRoot)
    // console.log()
    printSimpleTree({ simpleTree: e, indent })
  })
}

// printSimpleTree({ simpleTree:walkDirectory() })

console.log(walkDirectory().simpleArray)
