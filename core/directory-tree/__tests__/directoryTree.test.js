const { DirectoryTree } = require('../index')
const path = require('path')

describe('DirectoryTree class and object', function () {
  it('should create a basic DirectoryTree', function () {
    const absPath1 = path.join(__dirname, 'test_dir', 'directory6')
    const dT1 = new DirectoryTree(absPath1)
    expect(dT1.empty()).toEqual(true)
    expect(dT1.rootPath()).toEqual(absPath1)
    expect(dT1.nodeCount()).toEqual(0)
    expect(dT1.fileCount()).toEqual(0)
    expect(dT1.directoryCount()).toEqual(0)
    expect(typeof dT1.toJson() === 'object').toEqual(true)

    const dT2 = new DirectoryTree()
    // console.log(dT1.toJson())
    dT2.fromJson(dT1.toJson())
    expect(dT2.empty()).toEqual(true)
    expect(dT2.rootPath()).toEqual(absPath1)
    expect(dT2.nodeCount()).toEqual(0)
    expect(dT2.fileCount()).toEqual(0)
    expect(dT2.directoryCount()).toEqual(0)
    expect(typeof dT2.toJson() === 'object').toEqual(true)

    dT1.read()
    expect(dT1.empty()).toEqual(false)
    expect(dT1.rootPath()).toEqual(absPath1)
    expect(dT1.nodeCount()).toEqual(4)
    expect(dT1.fileCount()).toEqual(3)
    expect(dT1.directoryCount()).toEqual(1)
    expect(typeof dT1.toJson() === 'object').toEqual(true)

    const dT3 = new DirectoryTree()
    dT3.fromJson(dT1.toJson())
    expect(dT3.isEqualTo(dT1)).toEqual(true)
  })

  it('test1', function () {
    const absPath1 = path.join(__dirname, 'test_dir')
    const dT1 = new DirectoryTree(absPath1)
    dT1.read()

    console.log(dT1)
  })
})

// static value tests for dt and utils
// check methods and props working
