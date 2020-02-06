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
      df.set(123123)
    }).toThrow('must be a big integer')

    expect(df.get()).toEqual(1000001)
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

    expect(df.get()).toMatchObject([
      1000001,
      1000002,
      1000003
    ])
  })

  it('should define a simple field with actions and use it in array', function () {
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

    expect(df.get()).toMatchObject([
      2000002,
      2000004,
      2000006
    ])
  })

  it('should add messages and use them for a new field', function () { })

  it('should create a new DataField', function () { })
})
