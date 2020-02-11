const { DataFieldFactory } = require('../dataField.factory')

describe('DataField', function () {
  it('should manage initial undefined values', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'object' } })
    expect(df1.get()).toEqual(null)
    expect(df1.rawValueRef).toEqual(null)
    expect(df1.unset).toEqual(true)

    df1.set({})
    expect(df1.get()).toEqual({})
    expect(df1.rawValueRef).toEqual({})
    expect(df1.unset).toEqual(false)

    df1.unset = true
    expect(df1.get()).toEqual(null)
    expect(df1.rawValueRef).toEqual(null)
    expect(df1.unset).toEqual(true)
  })

  it('should manage initially defined values', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'object' }, value: { x: 123 } })
    expect(df1.get()).toMatchObject({ x: 123 })
    expect(df1.rawValueRef).toEqual({ x: 123 })
    expect(df1.unset).toEqual(false)

    df1.unset = true
    expect(df1.get()).toEqual(null)
    expect(df1.rawValueRef).toEqual(null)
    expect(df1.unset).toEqual(true)

    df1.set({ x: 567 })
    expect(df1.get()).toMatchObject({ x: 567 })
    expect(df1.rawValueRef).toEqual({ x: 567 })
    expect(df1.unset).toEqual(false)
  })

  it('should have a description for simple type', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field1', schema: { type: 'number', min: 12 }, value: 14, description: 'my test description' })
    expect(df1.description[0]).toEqual('my test description')
    expect(df1.description[1]).toEqual('- type: number')
    expect(df1.description[2]).toEqual('- min: 12')
  })

  it('should have a description for complex type', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df2 = dff.create({
      name: 'field2',
      schema: {
        type: 'object',
        props: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      },
      description: 'my test big description'
    })

    expect(df2.description[0]).toEqual('my test big description')
    expect(df2.description[1]).toEqual('- type: object')
    expect(df2.description[2]).toEqual('- props: {"name":{"type":"string"},"age":{"type":"number"}}')
  })

  it('should manage implicit type in schema', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df2 = dff.create({
      name: 'field2',
      schema: {
        type: 'object',
        props: {
          name: 'string',
          age: 'number'
        }
      }
    })

    expect(function () {
      df2.set({
        name: 'abc',
        age: 'x'
      })
    }).toThrow('Invalid value')

    expect(function () {
      df2.set({
        name: 'abc',
        age: 12
      })
    }).not.toThrow()
  })

  it('should manage implicit custom type in schema', function () {
    const dff = new DataFieldFactory()

    dff.define('superInt', function (validator) {
      return {
        validate: (value, schema) => {
          if (value < 1000000) return validator.makeError('number', null, value)
          return true
        }
      }
    })
    dff.initFactory()

    const df3 = dff.create({
      name: 'field3',
      schema: {
        type: 'object',
        props: {
          name: 'string',
          age: 'superInt'
        }
      }
    })

    expect(function () {
      df3.set({
        name: 'abc',
        age: 1000000 - 1
      })
    }).toThrow('Invalid value')

    expect(function () {
      df3.set({
        name: 'abc',
        age: 1000000
      })
    }).not.toThrow('Invalid value')
  })

  it('should preserve the internal data', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field1', schema: 'object' })
    const obj0 = { name: 'abc', age: 12 }
    const obj1 = { name: 'abc', age: 12 }

    df1.set(obj1)
    expect(df1.get()).toMatchObject(obj0)

    obj1.age = 21
    expect(df1.get()).toMatchObject(obj0)

    const obj2 = df1.get()
    obj2.age = 31
    expect(df1.get()).toMatchObject(obj0)

    const obj3 = df1.rawValueRef
    obj3.age = 31
    expect(df1.get()).toMatchObject(obj3)
  })

  it('should define clean method', function() { })

  it('should support read-only schema property', function() { })
})
