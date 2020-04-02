const path = require('path')
const tH = require('./dataFieldBuiltIn.testHelpers')('absDirPath')

describe('DataFieldBuiltInFactory absDirPath field type', function () {
  beforeAll(function () {
    tH.DFBF.initFactory()
  })

  it('should throw notAbsDirPath error', function () {
    tH.throwInvalidPathFn('notAbsDirPath')
  })

  // it('should throw dirNotExists error', function () {
  //   tH.throwPathNotExistsFn('dirNotExists', path.join(tH.rootDir, 'not', 'exists'))
  // })
  //
  // it('should throw dirAlreadyExists error', function () {
  //   tH.throwPathAlreadyExistsFn('dirAlreadyExists', path.join(tH.testDir, 'directory1', 'directory2'))
  // })
  //
  // it('should throw dirNotCreated error', function () {
  //   tH.throwPathNotCreatedFn('dirNotCreated', path.join(tH.rootDir, 'new-dir'))
  // })

  it('should support empty initial path', function () {
    tH.supportEmptyInitialPath('notAbsDirPath')
  })

  it('should support default path', function () {
    tH.supportDefaultPath(path.join(tH.testDir, 'directory1', 'directory2'))
  })

  // it('should support schema.presence = true', function () {
  //   tH.schemaPresenceTrueFn(path.join(tH.testDir, 'directory1', 'directory2'))
  // })
  //
  // it('should support schema.presence = false', function () {
  //   tH.schemaPresenceFalseFn(path.join(tH.testDir, 'directory1', 'not', 'directory2'))
  // })
  //
  // it('should support schema.ensure (not create)', function () {
  //   tH.schemaEnsureFn(path.join(tH.testDir, 'directory1', 'directory2'), false)
  // })
  //
  // it('should support schema.ensure (create)', function () {
  //   tH.schemaEnsureFn(path.join(tH.testDir, 'directory1', 'dir123'), true)
  // })

  it('should have fn.exists', async function () {
    await tH.customFnExists(path.join(tH.testDir, 'directory1', 'directory2'))
  })

  it('should have fn.ensure and fn.delete', async function () {
    await tH.customFnEnsureDelete(path.join(tH.testDir, 'directory1', 'directory2z'))
  })
})
