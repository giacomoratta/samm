const { DataFieldFactory } = require('../dataField.factory')
const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')

describe('DataField.fn for object schema', function () {
  it('should have custom fn for \'object\' schema types', function () {
    const dff = new DataFieldBuiltInFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field1', schema: { type: 'object', props: { name: 'string', age: 'number' } } })

    df1.value = {
      name: 'test1',
      age: 12
    }

    df1.fn.setProp('name', 'cde')
    expect(df1.valueRef).toMatchObject({
      name: 'cde',
      age: 12
    })
    expect(df1.fn.getProp('age')).toEqual(12)

    df1.fn.setProp('newProp', 444)
    expect(df1.valueRef).toMatchObject({
      name: 'cde',
      age: 12,
      newProp: 444
    })

    expect(function () { df1.fn.unsetProp('age') }).toThrow('field is required')
    df1.fn.unsetProp('newProp')
    expect(df1.valueRef).toMatchObject({
      name: 'cde',
      age: 12
    })
  })
})
