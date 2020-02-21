const path = require('path')
const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')
const dfbf = new DataFieldBuiltInFactory()
const tH = require('./dataFieldBuiltIn.testHelpers')(dfbf, 'absDirPath')

describe('DataFieldBuiltInFactory absDirPath field type', function () {
  beforeAll(function () {
    dfbf.initFactory()
  })

  it('should throw notAbsDirPath error', function () {
    tH.throwInvalidPathFn('notAbsDirPath')
  })

  it('should throw dirNotExists error', function () {
    tH.throwPathNotExistsFn('dirNotExists', path.join(tH.rootDir, 'not', 'exists'))
  })

  it('should throw dirAlreadyExists error', function () {
    tH.throwPathAlreadyExistsFn('dirAlreadyExists', path.join(tH.testDir, 'directory1', 'directory2'))
  })

  it('should throw dirNotCreated error', function () {
    tH.throwPathNotCreatedFn('dirNotCreated', path.join(tH.rootDir, 'new-dir'))
  })

  // it('should throw notRelDirPath error', function () { })
  // it('should throw invalidBasePath error', function () { })
  // it('should throw dirNotExists error', function () { })
  // it('should throw dirAlreadyExists error', function () { })
  // it('should throw dirNotCreated error', function () { })
  // it('should support schema.basePath', function () { })
  //
  // it('should throw notAbsFilePath error', function () { })
  // it('should throw fileNotExists error', function () { })
  // it('should throw fileAlreadyExists error', function () { })
  // it('should throw fileNotCreated error', function () { })
  //
  // it('should throw notRelFilePath error', function () { })
  // it('should throw invalidBasePath error', function () { })
  // it('should throw fileNotExists error', function () { })
  // it('should throw fileAlreadyExists error', function () { })
  // it('should throw fileNotCreated error', function () { })
  // it('should support schema.basePath', function () { })

  it('should support schema.presence = true', function () {
    tH.schemaPresenceTrueFn(path.join(tH.testDir, 'directory1', 'directory2'))
  })

  it('should support schema.presence = false', function () {
    tH.schemaPresenceFalseFn(path.join(tH.testDir, 'directory1', 'not', 'directory2'))
  })

  it('should support schema.ensure (not create)', function () {
    tH.schemaEnsureFn(path.join(tH.testDir, 'directory1', 'directory2'), false)
  })

  it('should support schema.ensure (create)', function () {
    tH.schemaEnsureFn(path.join(tH.testDir, 'directory1', 'dir123'), true)
  })

  it('should have fn.exists', async function () {
    await tH.customFnExists(path.join(tH.testDir, 'directory1', 'directory2'))
  })

  it('should have fn.ensure', function () { })
  it('should have fn.delete', function () { })
  it('should have fn.changeBasePath', function () { })
  it('should have fn.fromAbsPath', function () { })
  it('should have fn.toAbsPath', function () { })

  it('should support empty initial path', function () { })
  it('should support default path', function () { })
  it('should support an initial path', function () { })
})
