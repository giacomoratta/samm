const path = require('path')
const DirectoryTree = require('../directoryTree.class')
const PathInfo = require('../pathInfo.class')

function readDirectory1 () {
  const absPath = path.join(__dirname, 'test_dir')
  const dT1 = new DirectoryTree(absPath)
  dT1.read()
  dT1.forEach({
    itemCb: ({ item }) => {
      console.log(item.base, item.level)
    }
  })
}

function walkDirectory1 () {
  const absPath = path.join(__dirname, 'test_dir')
  const a = []
  const dT1 = new DirectoryTree(absPath)
  dT1.read()
  dT1.walk({
    itemCb: ({ item }) => {
      a.push({ b1: item.base, l1: item.level })
      // console.log(item.base, item.level)
    }
  })

  let i = 0

  const dT3 = new DirectoryTree()
  dT3.fromJson(dT1.toJson())
  // dT3.isEqualTo(dT1)
  console.log(dT3.isEqualTo(dT1))

  dT3.walk({
    itemCb: ({ item }) => {
      a[i].b2 = item.base
      a[i].l2 = item.level
      i++
      // console.log(item.base, item.level)
    }
  })

  a.forEach((item) => {
    if (item.b1 === item.b2 && item.l1 === item.l2) return
    console.log(item)
  })
}

function readDirectory2 () {
  const absPath = path.join(__dirname, 'test_dir')
  const dT1 = new DirectoryTree(absPath, {
    // includedExtensions: [ 'json' , 'wav' ]
    // excludedPaths: [
    //     'test_dir/directory1/directory3',
    //     '/home/giacomo/Workspace/mpl/core/directory-tree/__tests__/test_dir/directory6'
    // ]
  })
  dT1.read()
  dT1.forEach({
    itemCb: ({ item }) => {
      console.log(item.base, item.level)
    }
  })
}

readDirectory2()
