const path = require('path')
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

  it('should manage initial defined values', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'object' }, value: { x:123 } })
    expect(df1.get()).toMatchObject({ x:123})
    expect(df1.rawValue).toEqual({ x:123})
    expect(df1.unset).toEqual(false)

    df1.unset = true
    expect(df1.get()).toEqual(null)
    expect(df1.rawValue).toEqual(null)
    expect(df1.unset).toEqual(true)

    df1.set({ x:567 })
    expect(df1.get()).toMatchObject({ x:567})
    expect(df1.rawValue).toEqual({ x:567})
    expect(df1.unset).toEqual(false)
  })


  it('should avoid null or undefined values', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    expect(function () {
      dff.create({ name: 'field', schema: { type: 'object', default: null } })
      return
    }).toThrow('defined and not null')

    expect(function () {
      dff.create({ name: 'field', schema: { type: 'object' }, value: null })
    }
    ).toThrow('defined and not null')

    expect(function () {
      const df1 = dff.create({ name: 'field', schema: { type: 'number', default: 12 } })
      df1.set(null)
    }).toThrow('defined and not null')
  })

  it('should manage initial value for number', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'number' }, value: 32 })
    expect(df1.get()).toEqual(32)
    expect(df1.unset).toEqual(false)

    df1.unset = true
    expect(df1.unset).toEqual(true)

    df1.set(543)
    expect(df1.get()).toEqual(543)
    expect(df1.unset).toEqual(false)
  })

  it('should manage default value for number', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'number', default: 11 } })
    expect(df1.get()).toEqual(null)
    expect(df1.rawValue).toEqual(null)
    expect(df1.unset).toEqual(true)
  })

  it('should manage initial value for object', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'object' }, value: {} })
    expect(df1.get()).toEqual({})
    expect(df1.rawValue).toEqual({})
    expect(df1.unset).toEqual(false)
  })

  it('should manage default value for object', function () {
    const dff = new DataFieldFactory()
    dff.initFactory()

    const df1 = dff.create({ name: 'field', schema: { type: 'object', default: {} } })
    expect(df1.get()).toEqual(null)
    expect(df1.rawValue).toEqual(null)
    expect(df1.unset).toEqual(true)
  })

  it('should ...', function () { })

  it('should ...', function () { })

  it('should ...', function () { })

  it('should ...', function () { })

  it('should ...', function () { })
})
