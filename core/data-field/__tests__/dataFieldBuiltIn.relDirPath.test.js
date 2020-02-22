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

  /* Tests for relative path fields  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  */

  it('should throw invalidBasePath error', function () {
    tH.throwInvalidBasePathFn('invalidBasePath')
  })

  it('should have fn.changeBasePath', function () {
    tH.customFnChangeBasePath(path.join(tH.testDir, 'directory2'))
  })

  it('should have fn.fromAbsPath', function () {
    tH.customFnFromAbsPath(
      path.join('directory1', 'directory2'),
      tH.testDir,
      path.join(tH.testDir, 'directory1', 'directory33'),
      path.join(tH.rootDir, 'different', 'root')
    )
  })

  it('should have fn.toAbsPath', function () {
    tH.customFnToAbsPath(path.join('directory1', 'directory2'), tH.testDir)
  })
})
