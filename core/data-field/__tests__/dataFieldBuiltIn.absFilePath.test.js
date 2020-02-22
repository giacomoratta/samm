const path = require('path')
const tH = require('./dataFieldBuiltIn.testHelpers')('absFilePath')

describe('DataFieldBuiltInFactory absFilePath field type', function () {
  beforeAll(function () {
    tH.DFBF.initFactory()
  })

  it('should throw notAbsFilePath error', function () {
    tH.throwInvalidPathFn('notAbsFilePath')
  })

  it('should throw fileNotExists error', function () {
    tH.throwPathNotExistsFn('fileNotExists', path.join(tH.rootDir, 'not', 'exists'))
  })

  it('should throw fileAlreadyExists error', function () {
    tH.throwPathAlreadyExistsFn('fileAlreadyExists', path.join(tH.testDir, 'directory1', 'file11.txt'))
  })

  it('should throw fileNotCreated error', function () {
    tH.throwPathNotCreatedFn('fileNotCreated', path.join(tH.rootDir, 'new-file33.txt'))
  })

  it('should support empty initial path', function () {
    tH.supportEmptyInitialPath('notAbsFilePath')
  })

  it('should support default path', function () {
    tH.supportDefaultPath(path.join(tH.testDir, 'directory1', 'file11.txt'))
  })

  it('should support schema.presence = true', function () {
    tH.schemaPresenceTrueFn(path.join(tH.testDir, 'directory1', 'file11.txt'))
  })

  it('should support schema.presence = false', function () {
    tH.schemaPresenceFalseFn(path.join(tH.testDir, 'directory1', 'not', 'file11.txt'))
  })

  it('should support schema.ensure (not create)', function () {
    tH.schemaEnsureFn(path.join(tH.testDir, 'directory1', 'file11.txt'), false)
  })

  it('should support schema.ensure (create)', function () {
    tH.schemaEnsureFn(path.join(tH.testDir, 'directory1', 'file123.txt'), true)
  })

  it('should have fn.exists', async function () {
    await tH.customFnExists(path.join(tH.testDir, 'directory1', 'file11.txt'))
  })

  it('should have fn.ensure and fn.delete', async function () {
    await tH.customFnEnsureDelete(path.join(tH.testDir, 'directory1', 'file44.txt'))
  })
})
