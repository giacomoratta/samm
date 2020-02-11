const { DataFieldFactory } = require('../dataField.factory')

describe('DataField.fn for standard schema types', function () {
  it('should have custom fn for \'array\' schema types', function () {
    const dff = new DataFieldFactory()
    dff.messages({
      notSuperInt: 'The \'{field}\' field must be a big integer! Actual: {actual}'
    })
    dff.define('superInt', function (validator) {
      return {
        validate: (value, schema) => {
          if (value < 1000000) return validator.makeError('notSuperInt', null, value)
          return true
        },
        get: (value) => {
          return value * 2
        },
        set: (value) => {
          return value + 999
        }
      }
    })
    dff.initFactory()

    const df = dff.create({
      name: 'myBigIntArray',
      schema: {
        type: 'array',
        items: { type: 'superInt' }
      },
      value: [
        1000001,
        1000002,
        1000003
      ]
    })

    expect(function () { df.fn.add(24) }).toThrow('must be a big integer')

    expect(function () { df.fn.add(11111111124) }).not.toThrow()
    expect(function () { df.fn.add(100003232, 2) }).not.toThrow()
    expect(df.get()).toMatchObject([
      2002000,
      2002002,
      100003232 * 2,
      2002004,
      11111111124 * 2
    ])

    expect(function () { df.fn.remove(1000002 + 999) }).not.toThrow()
    expect(function () { df.fn.remove(null, 2) }).not.toThrow()
    expect(function () { df.fn.remove() }).not.toThrow()
    expect(df.get()).toMatchObject([
      2002000,
      100003232 * 2
      // 22222222248
    ])
  })

  it('should have custom fn for \'object\' schema types', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field1', schema: { type: 'object', props: { name: 'string', age: 'number' } } })

    df1.set({
      name: 'test1',
      age: 12
    })

    df1.fn.setProp('name', 'cde')
    expect(df1.rawValueRef).toMatchObject({
      name: 'cde',
      age: 12
    })
    expect(df1.fn.getProp('age')).toEqual(12)

    df1.fn.setProp('newProp', 444)
    expect(df1.rawValueRef).toMatchObject({
      name: 'cde',
      age: 12,
      newProp: 444
    })

    expect(function () { df1.fn.unsetProp('age') }).toThrow('field is required')
    df1.fn.unsetProp('newProp')
    expect(df1.rawValueRef).toMatchObject({
      name: 'cde',
      age: 12
    })
  })
})
