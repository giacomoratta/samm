const { PathInfoSync } = require('../index')
const path = require('path')
const baseRoot = path.parse(__dirname).root

describe('PathInfoSync class and object', function () {
  it('should throw some basic errors', function () {
    const pInfo1 = new PathInfoSync()
    expect(function () { pInfo1.set({ absolutePath: 123123 }) }).toThrow('Invalid path')
    expect(function () { pInfo1.set({ absolutePath: 123123 }) }).toThrow('Invalid path')
    expect(function () { pInfo1.set({ absolutePath: path.join('abc', 'abc-test') }) }).toThrow('Invalid path')
    expect(function () { pInfo1.set({ absolutePath: path.join(baseRoot, 'x') }) }).toThrow('Path does not exist')
    expect(function () { pInfo1.set({ absolutePath: path.join(baseRoot, 'x'), relRootPath: 123 }) }).toThrow('Invalid relative root path')
    expect(function () { pInfo1.set({ absolutePath: path.join(baseRoot, 'x') }) }).toThrow('Path does not exist')
  })

  it('should throw errors due to wrong relative root path', function () {
    const pInfo1 = new PathInfoSync()
    let relRootPath, absolutePath

    relRootPath = path.join('top', 'test_dir22')
    absolutePath = path.join(__dirname, 'test_dir', 'directory6', 'file64.json')
    expect(function () { pInfo1.set({ absolutePath, relRootPath }) }).toThrow('Invalid relative root path')
    expect(pInfo1.isSet()).toEqual(false)

    relRootPath = ''
    absolutePath = path.join(__dirname, 'test_dir', 'directory6', 'file64.json')
    expect(function () { pInfo1.set({ absolutePath, relRootPath }) }).toThrow('must be a not-empty string')
    expect(pInfo1.isSet()).toEqual(true)
  })

  it('should set relative root path', function () {
    const pInfo1 = new PathInfoSync()

    let relRootPath = path.join(__dirname, 'test_dir')
    let absolutePath = path.join(__dirname, 'test_dir', 'directory6', 'file64.json')
    pInfo1.set({ absolutePath, relRootPath })
    expect(pInfo1.relPath).toEqual(path.join('directory6', 'file64.json'))
    expect(pInfo1.relRoot).toEqual(relRootPath)
    expect(pInfo1.isSet()).toEqual(true)
    expect(pInfo1.level).toEqual(3)

    relRootPath = path.join(__dirname, 'test_dir')
    absolutePath = path.join(__dirname, 'test_dir', 'directory6', 'file64.json')
    pInfo1.set({ absolutePath })
    expect(pInfo1.isSet()).toEqual(true)
    expect(pInfo1.level).toEqual(1)
    pInfo1.relRoot = relRootPath
    expect(pInfo1.relRoot).toEqual(relRootPath)
    expect(pInfo1.level).toEqual(3)
  })

  it('should read directory information', function () {
    const pInfo1 = new PathInfoSync()

    const relRootPath = path.join(__dirname, 'test_dir')
    const absolutePath = path.join(__dirname, 'test_dir', 'directory1', 'directory2')
    pInfo1.set({ absolutePath, relRootPath })

    expect(pInfo1.path).toEqual(absolutePath)
    expect(pInfo1.base).toEqual('directory2')
    expect(pInfo1.name).toEqual('directory2')
    expect(pInfo1.ext).toEqual('')
    expect(pInfo1.level).toEqual(3)
    expect(pInfo1.isFile).toEqual(false)
    expect(pInfo1.isDirectory).toEqual(true)
    expect(pInfo1.relRoot).toEqual(relRootPath)
    expect(pInfo1.relPath).toEqual(path.join('directory1', 'directory2'))
  })

  it('should read file information', function () {
    const pInfo1 = new PathInfoSync()

    const relRootPath = path.join(__dirname, 'test_dir')
    const absolutePath = path.join(__dirname, 'test_dir', 'directory1', 'directory2', 'file26.json')
    pInfo1.set({ absolutePath, relRootPath })

    expect(pInfo1.path).toEqual(absolutePath)
    expect(pInfo1.base).toEqual('file26.json')
    expect(pInfo1.name).toEqual('file26')
    expect(pInfo1.ext).toEqual('json')
    expect(pInfo1.level).toEqual(4)
    expect(pInfo1.isFile).toEqual(true)
    expect(pInfo1.isDirectory).toEqual(false)
    expect(pInfo1.relRoot).toEqual(relRootPath)
    expect(pInfo1.relPath).toEqual(path.join('directory1', 'directory2', 'file26.json'))
  })

  it('should import and export JSON', function () {
    const pInfo1 = new PathInfoSync()

    const relRootPath = path.join(__dirname, 'test_dir')
    const absolutePath = path.join(__dirname, 'test_dir', 'directory1', 'directory2', 'file26.json')
    pInfo1.set({ absolutePath, relRootPath })

    const pInfo1Json = pInfo1.toJson()
    expect(pInfo1Json.relRoot).toEqual(relRootPath)
    expect(pInfo1Json.path).toEqual(absolutePath)
    expect(pInfo1Json.size >= 0).toEqual(true)
    expect(pInfo1Json.createdAt > 0).toEqual(true)
    expect(pInfo1Json.modifiedAt > 0).toEqual(true)

    const pInfo2 = new PathInfoSync()
    pInfo2.fromJson(pInfo1Json)
    expect(pInfo2.relRoot).toEqual(relRootPath)
    expect(pInfo2.path).toEqual(absolutePath)
    expect(pInfo2.size >= 0).toEqual(true)
    expect(pInfo2.createdAt > 0).toEqual(true)
    expect(pInfo2.modifiedAt > 0).toEqual(true)
  })
})
