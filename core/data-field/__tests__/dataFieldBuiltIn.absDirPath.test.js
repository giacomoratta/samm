const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')
let dfbf

describe('DataFieldBuiltInFactory absDirPath field type', function () {
  beforeAll(function () {
    dfbf = new DataFieldBuiltInFactory()
    dfbf.initFactory()
  })

  it('should throw notAbsDirPath error', function () { })
  it('should throw dirNotExists error', function () { })
  it('should throw dirAlreadyExists error', function () { })
  it('should throw dirNotCreated error', function () { })

  it('should throw notRelDirPath error', function () { })
  it('should throw invalidBasePath error', function () { })
  it('should throw dirNotExists error', function () { })
  it('should throw dirAlreadyExists error', function () { })
  it('should throw dirNotCreated error', function () { })

  it('should throw notAbsFilePath error', function () { })
  it('should throw fileNotExists error', function () { })
  it('should throw fileAlreadyExists error', function () { })
  it('should throw fileNotCreated error', function () { })

  it('should throw notRelFilePath error', function () { })
  it('should throw invalidBasePath error', function () { })
  it('should throw fileNotExists error', function () { })
  it('should throw fileAlreadyExists error', function () { })
  it('should throw fileNotCreated error', function () { })

  it('should support schema.presence = true', function () { })
  it('should support schema.presence = false', function () { })
  it('should support schema.ensure', function () { })
  it('should support schema.basePath', function () { })

  it('should have fn.exists', function () { })
  it('should have fn.ensure', function () { })
  it('should have fn.delete', function () { })
  it('should have fn.changeBasePath', function () { })
  it('should have fn.fromAbsPath', function () { })
  it('should have fn.toAbsPath', function () { })

  it('should support empty initial path', function () { })

  it('should support default path', function () { })

  it('should support an initial path', function () { })
})
