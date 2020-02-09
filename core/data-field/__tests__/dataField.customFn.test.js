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
    dff.messages({
      notKmDistance: 'The \'{field}\' field must be a big integer! Actual: {actual}'
    })
    dff.define('kmDistance', function (validator) {
      return {
        validate: (value, schema) => {
          if (value < 1000000) return validator.makeError('notKmDistance', null, value)
          return true
        },
        get: (value) => {
          if (value > 1000) return `${value / 1000}km`
          return `${value}km`
        },
        set: (value) => {
          if (typeof value === 'string' && value.endsWith('km')) {
            value = parseFloat(value)
            return value * 1000
          }
          return value
        }
      }
    })
    dff.initFactory()

    const df1 = dff.create({
      name: 'myObj',
      schema: {
        type: 'object',
        props: {
          name: 'string',
          info: {
            type: 'object',
            props: {
              age: 'number',
              distance: 'kmDistance'
            }
          }
        }
      }
    })

    const obj0 = {
      name: 'abc',
      info: {
        age: 12,
        distance: 1230223
      }
    }

    df1.set(obj0)
    expect(df1.get().info.distance).toEqual('1230.223km')
    expect(df1.rawValue.info.distance).toEqual(1230223)

    expect(df1.get()).toMatchObject({
      name: 'abc',
      info: {
        age: 12,
        distance: '1230.223km'
      }
    })
    expect(df1.rawValue).toMatchObject(obj0)

    const obj1 = {
      name: 'abcd',
      info: {
        age: 23,
        distance: '2540.772km'
      }
    }

    df1.set(obj1)
    expect(df1.get().info.distance).toEqual('2540.772km')
    expect(df1.rawValue.info.distance).toEqual(2540772)

    expect(df1.get()).toMatchObject(obj1)
    expect(df1.rawValue).toMatchObject({
      name: 'abcd',
      info: {
        age: 23,
        distance: 2540772
      }
    })
  })
})
