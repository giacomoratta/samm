const path = require('path')
const tH = require('./dataFieldBuiltIn.testHelpers')('relDirPath')

describe('DataFieldBuiltInFactory relDirPath field type', function () {
  beforeAll(function () {
    tH.DFBF.initFactory()
  })

  it('should throw notRelDirPath error', function () {
    tH.throwInvalidPathFn('notRelDirPath')
  })

  it('should throw dirNotExists error', function () {
    tH.throwPathNotExistsFn('dirNotExists', path.join('not', 'exists'))
  })

  it('should throw dirAlreadyExists error', function () {
    tH.throwPathAlreadyExistsFn('dirAlreadyExists', path.join('directory1', 'directory2'), tH.testDir)
  })

  it('should throw dirNotCreated error', function () {
    tH.throwPathNotCreatedFn('dirNotCreated', 'new-dir')
  })

  it('should support empty initial path', function () {
    tH.supportEmptyInitialPath('notRelDirPath')
  })

  it('should support default path', function () {
    tH.supportDefaultPath(path.join('directory1', 'directory2'), tH.testDir)
  })

  it('should support schema.presence = true', function () {
    tH.schemaPresenceTrueFn(path.join('directory1', 'directory2'), tH.testDir)
  })

  it('should support schema.presence = false', function () {
    tH.schemaPresenceFalseFn(path.join('directory1', 'not', 'directory2'), tH.testDir)
  })

  it('should support schema.ensure (not create)', function () {
    tH.schemaEnsureFn(path.join('directory1', 'directory2'), false, tH.testDir)
  })

  it('should support schema.ensure (create)', function () {
    tH.schemaEnsureFn(path.join('directory1', 'dir123'), true, tH.testDir)
  })

  it('should have fn.exists', async function () {
    await tH.customFnExists(path.join('directory1', 'directory2'), tH.testDir)
  })

  it('should have fn.ensure and fn.delete', async function () {
    await tH.customFnEnsureDelete(path.join('directory1', 'directory2z'), tH.testDir)
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

  // it('should have fn.changeBasePath', function () { })
  // it('should have fn.fromAbsPath', function () { })
  // it('should have fn.toAbsPath', function () { })
})
