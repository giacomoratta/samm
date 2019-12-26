const { PathInfo } = require('../index')
const path = require('path')

describe('PathInfo class and object', function () {
  it('should create a PathInfo object from an absolute directory path', function () {
    expect(function () {
      return new PathInfo('asf/safsaf')
    }).toThrow('is not an absolute path')

    expect(function () {
      return new PathInfo('/x/')
    }).toThrow('path stats of')

    expect(function () {
      return new PathInfo({})
    }).toThrow('Invalid initData')

    const absDirPath1 = path.join(__dirname, 'test_dir', 'directory6')
    const pInfo1 = new PathInfo(absDirPath1)

    expect(absDirPath1.startsWith(pInfo1.root)).toEqual(true)
    expect(pInfo1.dir).toEqual(path.join(__dirname, 'test_dir'))
    expect(pInfo1.path).toEqual(absDirPath1)
    expect(pInfo1.base).toEqual('directory6')
    expect(pInfo1.name).toEqual('directory6')
    expect(pInfo1.ext).toEqual('')
    expect(pInfo1.level).toEqual(1)
    expect(pInfo1.size > 1).toEqual(true)
    expect(pInfo1.isFile).toEqual(false)
    expect(pInfo1.isDirectory).toEqual(true)
    expect(pInfo1.relRoot).toEqual(undefined)
    expect(pInfo1.relPath).toEqual(undefined)
  })

  it('should manage relRoot and relPath', function () {
    const absDirPath1 = path.join(__dirname, 'test_dir', 'directory1')
    let pInfo1 = new PathInfo(absDirPath1)
    pInfo1.relRoot = absDirPath1
    expect(pInfo1.relRoot).toEqual(absDirPath1)
    expect(pInfo1.relPath).toEqual('')
    expect(pInfo1.level).toEqual(1)

    const absFilePath1 = path.join(__dirname, 'test_dir', 'directory1', 'directory2', 'file26.json')
    pInfo1 = new PathInfo(absFilePath1)
    pInfo1.relRoot = path.join(__dirname, 'test_dir', 'directory1', 'directory2')
    expect(pInfo1.relRoot).toEqual(path.join(__dirname, 'test_dir', 'directory1', 'directory2'))
    expect(pInfo1.relPath).toEqual('file26.json')
    expect(pInfo1.level).toEqual(2)

    pInfo1 = new PathInfo(absFilePath1)
    pInfo1.relRoot = path.join(__dirname, 'test_dir')
    expect(pInfo1.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(pInfo1.relPath).toEqual(path.join('directory1', 'directory2', 'file26.json'))
    expect(pInfo1.level).toEqual(4)
  })

  it('should create a PathInfo object from an absolute file path', function () {
    const absFilePath1 = path.join(__dirname, 'test_dir', 'directory6', 'file61.txt')
    const pInfo1 = new PathInfo(absFilePath1)

    expect(absFilePath1.startsWith(pInfo1.root)).toEqual(true)
    expect(pInfo1.dir).toEqual(path.join(__dirname, 'test_dir', 'directory6'))
    expect(pInfo1.path).toEqual(absFilePath1)
    expect(pInfo1.base).toEqual('file61.txt')
    expect(pInfo1.name).toEqual('file61')
    expect(pInfo1.ext).toEqual('txt')
    expect(pInfo1.level).toEqual(1)
    expect(pInfo1.size > 1).toEqual(true)
    expect(pInfo1.isFile).toEqual(true)
    expect(pInfo1.isDirectory).toEqual(false)
    expect(pInfo1.relRoot).toEqual(undefined)
    expect(pInfo1.relPath).toEqual(undefined)
  })

  it('should create a PathInfo object from another PathInfo object (with clone deep)', function () {
    const absFilePath1 = path.join(__dirname, 'test_dir', 'directory6', 'file61.txt')
    const pInfo0 = new PathInfo(absFilePath1)
    const pInfo1 = new PathInfo(pInfo0)

    expect(pInfo0.isEqualTo(pInfo1)).toEqual(true)
    expect(pInfo1.isEqualTo(pInfo0)).toEqual(true)

    pInfo0.relRoot = '/'

    expect(pInfo0.isEqualTo(pInfo1)).toEqual(false)
    expect(pInfo1.isEqualTo(pInfo0)).toEqual(false)

    expect(absFilePath1.startsWith(pInfo1.root)).toEqual(true)
    expect(pInfo1.dir).toEqual(path.join(__dirname, 'test_dir', 'directory6'))
    expect(pInfo1.path).toEqual(absFilePath1)
    expect(pInfo1.base).toEqual('file61.txt')
    expect(pInfo1.name).toEqual('file61')
    expect(pInfo1.ext).toEqual('txt')
    expect(pInfo1.level).toEqual(1)
    expect(pInfo1.size > 1).toEqual(true)
    expect(pInfo1.isFile).toEqual(true)
    expect(pInfo1.isDirectory).toEqual(false)
    expect(pInfo1.relRoot).toEqual(undefined)
    expect(pInfo1.relPath).toEqual(undefined)
  })

  it('should NOT change PathInfo internal info', function () {
    const absFilePath1 = path.join(__dirname, 'test_dir', 'directory6', 'file61.txt')
    const pInfo1 = new PathInfo(absFilePath1)

    pInfo1.dir = '/bla/'
    pInfo1.path = '/bla/bla/'
    pInfo1.relPath = '/abc/'

    expect(absFilePath1.startsWith(pInfo1.root)).toEqual(true)
    expect(pInfo1.dir).toEqual(path.join(__dirname, 'test_dir', 'directory6'))
    expect(pInfo1.path).toEqual(absFilePath1)
    expect(pInfo1.base).toEqual('file61.txt')
    expect(pInfo1.name).toEqual('file61')
    expect(pInfo1.ext).toEqual('txt')
    expect(pInfo1.level).toEqual(1)
    expect(pInfo1.size > 1).toEqual(true)
    expect(pInfo1.isFile).toEqual(true)
    expect(pInfo1.isDirectory).toEqual(false)
    expect(pInfo1.relRoot).toEqual(undefined)
    expect(pInfo1.relPath).toEqual(undefined)
  })

  it('should import and export JSON', function () {
    const absFilePath1 = path.join(__dirname, 'test_dir', 'directory6', 'file61.txt')
    const pInfo1 = new PathInfo(absFilePath1)

    const expJson1 = pInfo1.toJson()
    expJson1.root = '/bla/bla'
    expect(expJson1).toMatchObject({
      root: '/bla/bla',
      dir: '/home/giacomo/Workspace/mpl/core/directory-tree/__tests__/test_dir/directory6',
      base: 'file61.txt',
      ext: 'txt',
      name: 'file61',
      path: '/home/giacomo/Workspace/mpl/core/directory-tree/__tests__/test_dir/directory6/file61.txt',
      level: 1,
      size: 42,
      isFile: true,
      isDirectory: false
    })

    expect(pInfo1.toJson()).toMatchObject({
      root: '/',
      dir: '/home/giacomo/Workspace/mpl/core/directory-tree/__tests__/test_dir/directory6',
      base: 'file61.txt',
      ext: 'txt',
      name: 'file61',
      path: '/home/giacomo/Workspace/mpl/core/directory-tree/__tests__/test_dir/directory6/file61.txt',
      level: 1,
      size: 42,
      isFile: true,
      isDirectory: false
    })

    pInfo1.fromJson(expJson1)
    expect(pInfo1.toJson()).toMatchObject({
      root: '/bla/bla',
      dir: '/home/giacomo/Workspace/mpl/core/directory-tree/__tests__/test_dir/directory6',
      base: 'file61.txt',
      ext: 'txt',
      name: 'file61',
      path: '/home/giacomo/Workspace/mpl/core/directory-tree/__tests__/test_dir/directory6/file61.txt',
      level: 1,
      size: 42,
      isFile: true,
      isDirectory: false
    })
  })
})
