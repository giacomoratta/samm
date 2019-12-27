const { SequoiaPath } = require('../index')
const path = require('path')

describe('SequoiaPath class and object', function () {
  it('should create a basic SequoiaPath', async function () {
    const absPath1 = path.join(__dirname, 'test_dir', 'directory6')
    const dT1 = new SequoiaPath(absPath1)
    expect(dT1.empty()).toEqual(true)
    expect(dT1.rootPath()).toEqual(absPath1)
    expect(dT1.nodeCount()).toEqual(0)
    expect(dT1.fileCount()).toEqual(0)
    expect(dT1.directoryCount()).toEqual(0)
    expect(typeof dT1.toJson() === 'object').toEqual(true)

    const dT2 = new SequoiaPath()
    dT2.fromJson(dT1.toJson())
    expect(dT2.empty()).toEqual(true)
    expect(dT2.rootPath()).toEqual(absPath1)
    expect(dT2.nodeCount()).toEqual(0)
    expect(dT2.fileCount()).toEqual(0)
    expect(dT2.directoryCount()).toEqual(0)
    expect(typeof dT2.toJson() === 'object').toEqual(true)

    await dT1.read()
    expect(dT1.empty()).toEqual(false)
    expect(dT1.rootPath()).toEqual(absPath1)
    expect(dT1.nodeCount()).toEqual(4)
    expect(dT1.fileCount()).toEqual(3)
    expect(dT1.directoryCount()).toEqual(1)
    expect(typeof dT1.toJson() === 'object').toEqual(true)

    const dT3 = new SequoiaPath()
    dT3.fromJson(dT1.toJson())
    expect(dT3.isEqualTo(dT1)).toEqual(true)
  })

  it('should loop and walk the directory tree', async function () {
    const absPath1 = path.join(__dirname, 'test_dir')
    const dT1 = new SequoiaPath(absPath1)

    await dT1.read()
    expect(dT1.empty()).toEqual(false)

    const filesArray1 = []
    const directoriesArray1 = []
    dT1.forEach({
      itemFn: ({ item }) => {
        if (item.isDirectory) directoriesArray1.push(item)
        else if (item.isFile) filesArray1.push(item)
      }
    })
    expect(directoriesArray1.length).toEqual(5)
    expect(filesArray1.length).toEqual(13)

    const filesArray2 = []
    const directoriesArray2 = []
    dT1.walk({
      itemFn: ({ item, parent, isFirstChild, isLastChild }) => {
        if (item.isDirectory) directoriesArray2.push(item)
        else if (item.isFile) filesArray2.push(item)

        if (item.base === 'test_dir') expect(item.level).toEqual(1)
        else if (item.base === 'file33.txt') expect(item.level).toEqual(4)
        else if (item.base === 'directory6') expect(item.level).toEqual(2)
        else if (item.base === 'file18.wav') {
          expect(item.ext).toEqual('wav')
          expect(item.level).toEqual(3)
        }
      }
    })
    expect(directoriesArray2.length).toEqual(5)
    expect(filesArray2.length).toEqual(13)
  })
})
