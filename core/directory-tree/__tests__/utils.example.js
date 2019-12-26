const path = require('path')
const utils = require('../utils')

function walkDirectory() {
    const absPath = path.join(__dirname,'test_dir')

    const simpleTree = { parent: null, children:[] }
    let currentNode = simpleTree

    let options = {
        itemCb: ({ item }) => {
            if(item.isFile) {
                const newNode = { item, parent: currentNode }
                currentNode.children.push(newNode)
            } else if(item.isDirectory) {
                const newNode = { item, children: [], parent: currentNode }
                currentNode.children.push(newNode)
                currentNode = newNode
            }
        },
        afterDirectoryCb: ({ item }) => {
            currentNode = currentNode.parent
        }
    }
    utils.walkDirectory(absPath,options)
    return simpleTree
}

function printSimpleTree({ simpleTree, indent=0 }) {
    const preString = ('   ').repeat(indent)
    indent++
    if(!simpleTree.children) return
    simpleTree.children.forEach((e) => {
        console.log(preString,e.item.base,'  L:',e.item.level)
        console.log(preString,e.item.relPath)
        //console.log(preString,e.item.relRoot)
        //console.log()
        printSimpleTree({ simpleTree:e, indent })
    })
}

printSimpleTree({ simpleTree:walkDirectory() })
