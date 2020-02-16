const { DataFieldFactory } = require('../dataField.factory')

describe('DataFieldFactory', function () {
  it('should throw some errors', function () {
    const dff = new DataFieldFactory()
    expect(function () { dff.define() }).toThrow('mandatory')

    dff.define('superInt', function () { })
    expect(function () { dff.define('superInt', function () { }) }).toThrow('exists')
  })

  it('should add messages in more than 2 steps', function () {
    const dff = new DataFieldFactory()
    dff.messages({
      msg1: 'abcde1',
      msg2: 'abcde2'
    })
    expect(Object.keys(dff._messages).length).toEqual(2)
    dff.messages({
      msg3: 'abcde3',
      msg4: 'abcde4',
      msg5: 'abcde5'
    })
    expect(Object.keys(dff._messages).length).toEqual(5)
  })

  it('should define a simple field', function () {
    const dff = new DataFieldFactory()
    dff.messages({
      notSuperInt: 'The \'{field}\' field must be a big integer! Actual: {actual}'
    })
    dff.define('superInt', function (validator) {
      return {
        validate: (value, schema) => {
          if (value < 1000000) return validator.makeError('notSuperInt', null, value)
          return true
        }
      }
    })
    dff.initFactory()

    expect(function () {
      return dff.create({
        name: 'myBigInt',
        schema: {
          type: 'superInt'
        },
        value: 999333
      })
    }).toThrow('must be a big integer')

    const df = dff.create({
      name: 'myBigInt',
      schema: {
        type: 'superInt'
      },
      value: 1000001
    })

    expect(function () {
      df.value = 123123
    }).toThrow('must be a big integer')

    expect(df.value).toEqual(1000001)
  })

  it('should define a simple field with generated GET, SET and customFn', function () {
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
        get: (field) => {
          return field.valueRef * 3
        },
        set: (value) => {
          return value * 9
        },
        add: (field, v1, v2) => {
          field.value = field.valueRef + v1 - v2
        }
      }
    })
    dff.initFactory()

    const df = dff.create({
      name: 'myBigInt',
      schema: {
        type: 'superInt'
      },
      value: 1000001
    })
    expect(df.fn.get()).toEqual(1000001 * 3)

    expect(df.value).toEqual(1000001 * 3 * 9)
    expect(df.valueRef).toEqual(1000001 * 9)

    df.fn.add(2, 3)
    expect(df.value).toEqual((1000001 * 9 + 2 - 3) * 3)

    expect(function () { df.fn.add(-11111112, 32) }).toThrow()
  })

  it('should define a simple field and use it in array', function () {
    const dff = new DataFieldFactory()
    dff.messages({
      notSuperInt: 'The \'{field}\' field must be a big integer! Actual: {actual}'
    })
    dff.define('superInt', function (validator) {
      return {
        validate: (value, schema) => {
          if (value < 1000000) return validator.makeError('notSuperInt', null, value)
          return true
        }
      }
    })
    dff.initFactory()

    expect(function () {
      return dff.create({
        name: 'myBigIntArray',
        schema: {
          type: 'array',
          items: 'superInt'
        },
        value: [
          1000001,
          100002,
          1000003
        ]
      })
    }).toThrow('must be a big integer')

    const df = dff.create({
      name: 'myBigIntArray',
      schema: {
        type: 'array',
        items: 'superInt'
      },
      value: [
        1000001,
        1000002,
        1000003
      ]
    })

    expect(df.value).toMatchObject([
      1000001,
      1000002,
      1000003
    ])
  })

  it('should define a simple field with generated GET, SET and customFn and use it in array', function () {
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

    expect(df.value).toMatchObject([
      2002000,
      2002002,
      2002004
    ])
    expect(function () { df.fn.add(24) }).toThrow('must be a big integer')
    expect(function () { df.fn.add(11111111124) }).not.toThrow()
    expect(df.value).toMatchObject([
      2002000,
      2002002,
      2002004,
      11111111124 * 2
    ])
  })

  it('should define a complex object field with generated GET, SET and customFn', function () {
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

    df1.value = obj0
    expect(df1.value.info.distance).toEqual('1230.223km')
    expect(df1.valueRef.info.distance).toEqual(1230223)

    expect(df1.value).toMatchObject({
      name: 'abc',
      info: {
        age: 12,
        distance: '1230.223km'
      }
    })
    expect(df1.valueRef).toMatchObject(obj0)

    const obj1 = {
      name: 'abcd',
      info: {
        age: 23,
        distance: '2540.772km'
      }
    }

    df1.value = obj1
    expect(df1.value.info.distance).toEqual('2540.772km')
    expect(df1.valueRef.info.distance).toEqual(2540772)

    expect(df1.value).toMatchObject(obj1)
    expect(df1.valueRef).toMatchObject({
      name: 'abcd',
      info: {
        age: 23,
        distance: 2540772
      }
    })
  })
})
