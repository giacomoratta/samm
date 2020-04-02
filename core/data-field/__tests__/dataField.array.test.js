const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')

describe('DataField.fn for array schema', function () {
  it('should have custom fn for \'array\' schema types', function () {
    const dff = new DataFieldBuiltInFactory()
    dff.messages({
      notSuperInt: 'The \'{field}\' field must be a big integer! Actual: {actual}'
    })
    dff.define('superInt', function () {
      return {
        $validate: function ({ schema, messages }, path, context) {
          const x = 1000000
          return {
            source: `
              if (value < ${x}) {
                ${this.makeError({ type: 'notSuperInt', actual: 'value', messages })}
              }
              return value
            `
          }
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

    expect(function () { df.fn.add(1000443) }).not.toThrow()
    expect(function () { df.fn.add(1000553, 2) }).not.toThrow()
    expect(df.value).toMatchObject([
      1000001,
      1000002,
      1000553,
      1000003,
      1000443
    ])

    expect(function () { df.fn.remove(1000002 + 999) }).not.toThrow()
    expect(function () { df.fn.remove(null, 2) }).not.toThrow()
    expect(function () { df.fn.remove() }).not.toThrow()
    expect(df.value).toMatchObject([
      1000001,
      1000002,
      1000003
    ])
  })
})
