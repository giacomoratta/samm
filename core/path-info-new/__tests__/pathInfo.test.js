const { PathInfo } = require('../index')
const path = require('path')
const baseRoot = path.parse(__dirname).root

describe('PathInfo class and object', function () {

  it('should throw some basic errors', async function () {
    const pInfo1 = new PathInfo()
    await expect(pInfo1.set({ absolutePath: 123123 })).rejects.toThrow('Invalid main path')
    await expect(pInfo1.set({ absolutePath: path.join('asf','safsaf') })).rejects.toThrow('Invalid main path')
    await expect(pInfo1.set({ absolutePath:path.join(baseRoot, 'x')})).rejects.toThrow('Cannot get path stats of')
    await expect(pInfo1.set({ absolutePath:path.join(baseRoot, 'x'), relRootPath: 123 })).rejects.toThrow('Invalid relative root path')
    await expect(pInfo1.set({ absolutePath:path.join(baseRoot, 'x')})).rejects.toThrow('Cannot get path stats of')
  })

  it('should throw errors due to wrong relative root path', async function () {
    const pInfo1 = new PathInfo()
    let relRootPath, absolutePath

    relRootPath = path.join('top','test_dir22')
    absolutePath = path.join(__dirname,'test_dir','directory6','file64.json')
    await expect(pInfo1.set({ absolutePath, relRootPath })).rejects.toThrow('Invalid relative root path')
    expect(pInfo1.isSet()).toEqual(false)

    relRootPath = ''
    absolutePath = path.join(__dirname,'test_dir','directory6','file64.json')
    await expect(pInfo1.set({ absolutePath, relRootPath })).rejects.toThrow('must be a not-empty')
    expect(pInfo1.isSet()).toEqual(true)
  })

  it('should set relative root path', async function () {
    const pInfo1 = new PathInfo()

    let relRootPath = path.join(__dirname,'test_dir')
    let absolutePath = path.join(__dirname,'test_dir','directory6','file64.json')
    await pInfo1.set({ absolutePath, relRootPath })
    expect(pInfo1.relPath).toEqual(path.join('directory6','file64.json'))
    expect(pInfo1.relRoot).toEqual(relRootPath)
    expect(pInfo1.isSet()).toEqual(true)
    expect(pInfo1.level).toEqual(3)

    relRootPath = path.join(__dirname,'test_dir')
    absolutePath = path.join(__dirname,'test_dir','directory6','file64.json')
    await pInfo1.set({ absolutePath })
    expect(pInfo1.isSet()).toEqual(true)
    expect(pInfo1.level).toEqual(1)
    pInfo1.relRoot = relRootPath
    expect(pInfo1.relRoot).toEqual(relRootPath)
    expect(pInfo1.level).toEqual(3)
  })

  it('should read directory information', function () {
    const pInfo1 = new PathInfo()

    let relRootPath = path.join(__dirname,'test_dir')
    let absolutePath = path.join(__dirname,'test_dir','directory6')
  })

  it('should read file information', function () {
    const pInfo1 = new PathInfo()

    let relRootPath = path.join(__dirname,'test_dir')
    let absolutePath = path.join(__dirname,'test_dir','directory6','file64.json')
  })

  it('should create a PathInfo----- object from an absolute directory path', function () {
    expect(async function () {
      const pInfo1 = new PathInfo()
      await pInfo1.set({ absolutePath:'asf/safsaf' })
    }).toThrow('is not an absolute path')

    // const pInfo1 = new PathInfo()
    // await expect(()).rejects.toEqual({
    //   error: 'User with 3 not found.',
    // });

    // expect(async function () {
    //   const pInfo1 = new PathInfo()
    //   try {
    //     await pInfo1.set({ absolutePath:'asf/safsaf' })
    //   } catch(e) {
    //     throw e
    //   }
    // }).toThrow('is not an absolute path')


    const absDirPath1 = path.join(__dirname, 'test_dir', 'directory6')
    const pInfo1 = new PathInfo(absDirPath1)
    pInfo1.set({ absolutePath:absDirPath1 })

    expect(absDirPath1.startsWith(pInfo1.root)).toEqual(true)
    expect(pInfo1.dir).toEqual(path.join(__dirname, 'test_dir'))
    expect(pInfo1.path).toEqual(absDirPath1)
    expect(pInfo1.base).toEqual('directory6')
    expect(pInfo1.name).toEqual('directory6')
    expect(pInfo1.ext).toEqual('')
    expect(pInfo1.level).toEqual(1)
    // expect(pInfo1.size === 0).toEqual(true) // on win
    // expect(pInfo1.size === 4096).toEqual(true) // on unix
    expect(pInfo1.isFile).toEqual(false)
    expect(pInfo1.isDirectory).toEqual(true)
    expect(pInfo1.relRoot).toEqual(undefined)
    expect(pInfo1.relPath).toEqual(undefined)
  })

  it('should manage relRoot and relPath', function () {
    const absDirPath1 = path.join(__dirname, 'test_dir', 'directory1')
    let pInfo1 = new PathInfo()
    pInfo1.set({ absolutePath:absDirPath1, relRootPath:absDirPath1 })
    expect(pInfo1.relRoot).toEqual(absDirPath1)
    expect(pInfo1.relPath).toEqual('')
    expect(pInfo1.level).toEqual(1)

    const absFilePath1 = path.join(__dirname, 'test_dir', 'directory1', 'directory2', 'file26.json')
    pInfo1 = new PathInfo()
    pInfo1.set({ absolutePath:absFilePath1, relRootPath:path.join(__dirname, 'test_dir', 'directory1', 'directory2') })
    expect(pInfo1.relRoot).toEqual(path.join(__dirname, 'test_dir', 'directory1', 'directory2'))
    expect(pInfo1.relPath).toEqual('file26.json')
    expect(pInfo1.level).toEqual(2)

    pInfo1 = new PathInfo()
    pInfo1.set({ absolutePath:absFilePath1, relRootPath:path.join(__dirname, 'test_dir') })
    expect(pInfo1.relRoot).toEqual(path.join(__dirname, 'test_dir'))
    expect(pInfo1.relPath).toEqual(path.join('directory1', 'directory2', 'file26.json'))
    expect(pInfo1.level).toEqual(4)
  })

  it('should create a PathInfo object from an absolute file path', function () {
    const absFilePath1 = path.join(__dirname, 'test_dir', 'directory6', 'file61.txt')
    const pInfo1 = new PathInfo()
    pInfo1.set({ absolutePath:absFilePath1 })

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
    const pInfo0 = new PathInfo()
    pInfo0.set({ absolutePath:absFilePath1 })
    const pInfo1 = pInfo0.clone()

    expect(pInfo0.isEqualTo(pInfo1)).toEqual(true)
    expect(pInfo1.isEqualTo(pInfo0)).toEqual(true)

    pInfo0.relRoot = path.sep

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
    const pInfo1 = new PathInfo()
    pInfo1.set({ absolutePath:absFilePath1 })

    pInfo1.dir = path.join(baseRoot, 'bla')
    pInfo1.path = path.join(baseRoot, 'bla', 'bla')
    pInfo1.relPath = path.join(baseRoot, 'abc')

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
    const pInfo1 = new PathInfo()
    pInfo1.set({ absolutePath:absFilePath1 })

    const expJson1 = pInfo1.toJson()
    expJson1.root = path.join(baseRoot, 'bla', 'bla')
    expect(expJson1).toMatchObject({
      root: path.join(baseRoot, 'bla', 'bla'),
      dir: path.join(__dirname, 'test_dir', 'directory6'),
      base: 'file61.txt',
      ext: 'txt',
      name: 'file61',
      path: path.join(__dirname, 'test_dir', 'directory6', 'file61.txt'),
      level: 1,
      // size: 42,
      isFile: true,
      isDirectory: false
    })

    expect(pInfo1.toJson()).toMatchObject({
      root: baseRoot,
      dir: path.join(__dirname, 'test_dir', 'directory6'),
      base: 'file61.txt',
      ext: 'txt',
      name: 'file61',
      path: path.join(__dirname, 'test_dir', 'directory6', 'file61.txt'),
      level: 1,
      // size: 42,
      isFile: true,
      isDirectory: false
    })

    pInfo1.fromJson(expJson1)
    expect(pInfo1.toJson()).toMatchObject({
      root: path.join(baseRoot, 'bla', 'bla'),
      dir: path.join(__dirname, 'test_dir', 'directory6'),
      base: 'file61.txt',
      ext: 'txt',
      name: 'file61',
      path: path.join(__dirname, 'test_dir', 'directory6', 'file61.txt'),
      level: 1,
      // size: 42,
      isFile: true,
      isDirectory: false
    })
  })
})
