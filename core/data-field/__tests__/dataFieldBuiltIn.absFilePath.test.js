const path = require('path')
const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')

describe('DataFieldBuiltInFactory absFilePath field type', function () {
  beforeAll(function () {
    dfbf = new DataFieldBuiltInFactory()
    dfbf.initFactory()
  })

  it('should throw some schema errors', function () {
    // missing schema fields
    // wrong schema fields
    // wrong schema attribute values
  })

  it('should throw for invalid paths in schema', function () { })

  it('should throw for invalid paths as value', function () { })

  it('should support empty initial path', function () { })

  it('should support default path', function () { })

  it('should support an initial path', function () { })

  it('should check if file exists', function () { })

  it('should ensure file', function () { })
})