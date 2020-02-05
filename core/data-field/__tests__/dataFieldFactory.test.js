const path = require('path')
const { DataFieldFactory } = require('../dataField.factory')

describe('DataFieldFactory', function () {

  it('should define a simple field', function () {
    const x = new DataFieldFactory()
    x.define()
  })

  it('should add messages and use them for a new field', function () { })

  it('should create a new DataField', function () { })

})

