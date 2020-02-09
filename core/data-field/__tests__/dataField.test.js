const { DataFieldFactory } = require('../dataField.factory')

describe('DataField', function () {
  it('should manage initial undefined values', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'object' } })
    expect(df1.get()).toEqual(null)
    expect(df1.rawValue).toEqual(null)
    expect(df1.unset).toEqual(true)

    df1.set({})
    expect(df1.get()).toEqual({})
    expect(df1.rawValue).toEqual({})
    expect(df1.unset).toEqual(false)

    df1.unset = true
    expect(df1.get()).toEqual(null)
    expect(df1.rawValue).toEqual(null)
    expect(df1.unset).toEqual(true)
  })

  it('should manage initially defined values', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'object' }, value: { x: 123 } })
    expect(df1.get()).toMatchObject({ x: 123 })
    expect(df1.rawValue).toEqual({ x: 123 })
    expect(df1.unset).toEqual(false)

    df1.unset = true
    expect(df1.get()).toEqual(null)
    expect(df1.rawValue).toEqual(null)
    expect(df1.unset).toEqual(true)

    df1.set({ x: 567 })
    expect(df1.get()).toMatchObject({ x: 567 })
    expect(df1.rawValue).toEqual({ x: 567 })
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

  // it('should ...', function () { })
  // it('should ...', function () { })
  // it('should ...', function () { })
})
