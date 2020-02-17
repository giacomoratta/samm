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

  it('should define a simple field with custom functions', function () {
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
        getTriple: (field) => {
          return field.valueRef * 3
        },
        setNineTimes: (field, value) => {
          const newValue = value * 9
          field.valueRef = newValue
          return newValue
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
    expect(df.fn.getTriple()).toEqual(1000001 * 3)
    expect(df.fn.setNineTimes(1010101)).toEqual(1010101 * 9)
    expect(df.value).toEqual(1010101 * 9)
    expect(df.valueRef).toEqual(1010101 * 9)
    expect(function () { df.fn.setNineTimes(-11111112) }).toThrow('notSuperInt')
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

  it('should define a simple field ans use it in object', function () {
    const dff = new DataFieldFactory()
    dff.messages({
      notKmDistance: 'The \'{field}\' field must be a big integer! Actual: {actual}'
    })
    dff.define('kmDistance', function (validator) {
      return {
        validate: (value, schema) => {
          if (typeof value !== 'number' || value < 1000000) return validator.makeError('notKmDistance', null, value)
          return true
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
    expect(df1.valueRef.info.distance).toEqual(1230223)

    expect(df1.value).toMatchObject({
      name: 'abc',
      info: {
        age: 12,
        distance: 1230223
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

    expect(function () {
      df1.value = {
        name: 'abcd',
        info: {
          age: 23,
          distance: '2540.772km'
        }
      }
    }).toThrow('notKmDistance')
    expect(df1.value.info.distance).toEqual(1230223)
    expect(df1.valueRef.info.distance).toEqual(1230223)
  })
})
