const { fileUtils } = require('../../utils/file.utils')
const path = require('path')
const _ = require('lodash')
const { DataField } = require('../../data-field-old1')
const baseRoot = path.parse(__dirname).root

const newDataField = function (args) {
  return new DataField(args)
}

describe('dataField class and object', function () {
  it('should create a simple dataField with events', function () {
    const dataField1 = new DataField({
      name: 'fieldname1',
      schema: { type: 'number', positive: true, integer: true },
      value: 32
    })
    expect(dataField1.get()).toEqual(32)

    let eventFired = false
    let eventFiredData = null

    dataField1.on('change', (e) => {
      eventFiredData = e
      eventFired = true
    })

    expect(function () {
      dataField1.on('invalid-event', (e) => {
        eventFiredData = e
        eventFired = true
      })
    }).toThrow('Unrecognized event')

    dataField1.set(42)
    expect(dataField1.get()).toEqual(42)

    expect(eventFired).toEqual(true)
    expect(eventFiredData.fieldName).toEqual('fieldname1')
    expect(eventFiredData.oldValue).toEqual(32)
    expect(eventFiredData.newValue).toEqual(42)

    dataField1.unset()
    expect(dataField1.get()).toEqual(null)
    expect(dataField1.get()).not.toEqual(undefined)

    dataField1.set(52)
    expect(dataField1.get()).toEqual(52)
  })

  it('should manage default attribute for schema', function () {
    const df1 = new DataField({
      name: 'array1',
      schema: {
        type: 'array',
        items: 'string'
      },
      value: ['a', 'b', 'c']
    })

    expect(df1.get()).toMatchObject(['a', 'b', 'c'])
    df1.set(['dd', 'ff'])
    expect(df1.get()).toEqual(['dd', 'ff'])
    expect(df1.get(false)).toEqual(['dd', 'ff'])

    const df2 = new DataField({
      name: 'array2',
      schema: {
        type: 'array',
        items: 'string',
        default: ['a', 'b', 'c']
      }
    })

    // console.warn(df2.get())
    // console.warn(df2.get(false))

    expect(df2.get()).toEqual(null)
    expect(df2.get(false)).toEqual(null)

    df2.set(['dd', 'ff'])
    expect(df2.get()).toEqual(['dd', 'ff'])
    expect(df2.get(false)).toEqual(['dd', 'ff'])

    df2.unset()
    expect(df2.get()).toEqual(null)
    expect(df2.get()).not.toEqual(undefined)

    df2.set(['dd', 'ff'])
    expect(df2.get()).toEqual(['dd', 'ff'])
  })

  it('should manage array with add/remove', function () {
    const df11 = new DataField({
      name: 'stdArray1',
      schema: {
        type: 'array',
        arrayDirection: 'bottom'
      },
      value: [1, 3]
    })

    expect(df11.add(5)).toEqual(true)
    expect(df11.get()).toMatchObject([1, 3, 5])

    expect(df11.add(7)).toEqual(true)
    expect(df11.get()).toMatchObject([1, 3, 5, 7])

    expect(df11.remove()).toEqual(true)
    expect(df11.get()).toMatchObject([1, 3, 5])

    expect(df11.remove(4)).toEqual(false)
    expect(df11.remove(1)).toEqual(true)
    expect(df11.get()).toMatchObject([1, 5])

    const df12 = new DataField({
      name: 'stdArray1',
      schema: {
        type: 'array',
        arrayDirection: 'top'
      },
      value: [1, 2]
    })

    expect(df12.add(5)).toEqual(true)
    expect(df12.get()).toMatchObject([5, 1, 2])

    expect(df12.add(7)).toEqual(true)
    expect(df12.get()).toMatchObject([7, 5, 1, 2])

    expect(df12.remove()).toEqual(true)
    expect(df12.get()).toMatchObject([5, 1, 2])

    expect(df12.remove(4)).toEqual(false)
    expect(df12.remove(1)).toEqual(true)
    expect(df12.get()).toMatchObject([5, 2])

    const df2 = new DataField({
      name: 'stdArray3',
      schema: {
        type: 'array',
        max: 3
      },
      value: [1, 2]
    })

    expect(df2.remove(3)).toEqual(false)
    expect(df2.remove(4)).toEqual(false)

    expect(df2.add(5)).toEqual(true)
    expect(df2.get()).toMatchObject([1, 2, 5])

    expect(df2.remove(3)).toEqual(false)
    expect(df2.remove(4)).toEqual(false)

    expect(df2.add(7)).toEqual(false)
    expect(df2.get()).toMatchObject([1, 2, 5])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([1, 2])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([1])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([])

    // insert/remove by index

    expect(function () { df2.set([1, 3, 5, 7]) }).toThrow('arrayMax')
    df2.set([3, 5, 7])
    expect(df2.add(5)).toEqual(false)
    expect(df2.get()).toMatchObject([3, 5, 7])
    expect(df2.add(3, 9)).toEqual(false)
    expect(df2.get()).toMatchObject([3, 5, 7])
    expect(df2.add(1, 9)).toEqual(false)
    expect(df2.get()).toMatchObject([3, 5, 7])
    expect(df2.remove(1)).toEqual(true)
    expect(df2.get()).toMatchObject([3, 7])
    expect(df2.add(1, 9)).toEqual(true)
    expect(df2.get()).toMatchObject([3, 9, 7])

    const df3 = new DataField({
      name: 'stdArray3',
      schema: {
        type: 'array',
        arrayDirection: 'top',
        max: 3
      },
      value: [1, 2]
    })

    expect(df3.remove(3)).toEqual(false)
    expect(df3.remove(4)).toEqual(false)

    expect(df3.add(5)).toEqual(true)
    expect(df3.get()).toMatchObject([5, 1, 2])

    expect(df3.remove(3)).toEqual(false)
    expect(df3.remove(4)).toEqual(false)

    expect(df3.remove()).toEqual(true)
    expect(df3.get()).toMatchObject([1, 2])

    expect(df3.remove()).toEqual(true)
    expect(df3.get()).toMatchObject([2])

    // expect(df2.remove()).toEqual(true)
    // expect(df2.get()).toMatchObject([])

    expect(df3.remove()).toEqual(true)
    expect(df3.get()).toMatchObject([])
  })

  it('should manage object with add/remove', function () {
    const df2 = new DataField({
      name: 'stdArray3',
      schema: {
        type: 'object',
        props: {}
      },
      value: {
        key1: 'v1',
        key2: 'v2',
        key3: 'v3'
      }
    })

    expect(df2.add('key4', 'v4')).toEqual(true)
    expect(df2.get()).toMatchObject({
      key1: 'v1',
      key2: 'v2',
      key3: 'v3',
      key4: 'v4'
    })

    expect(df2.remove('key2')).toEqual(true)
    expect(df2.get()).toMatchObject({
      key1: 'v1',
      key3: 'v3',
      key4: 'v4'
    })

    expect(df2.remove('key3')).toEqual(true)
    expect(df2.get()).toMatchObject({
      key1: 'v1',
      key4: 'v4'
    })

    expect(df2.remove('key1')).toEqual(true)
    expect(df2.get()).toMatchObject({
      key4: 'v4'
    })

    expect(df2.remove('blabla')).toEqual(true)
    expect(df2.get()).toMatchObject({
      key4: 'v4'
    })

    expect(df2.remove('key4')).toEqual(true)
    expect(df2.get()).toMatchObject({})

    expect(df2.remove('key41')).toEqual(true)
    expect(df2.get()).toMatchObject({})

    df2.unset()
    expect(df2.get()).toEqual(null)
    expect(df2.get()).not.toEqual(undefined)

    expect(df2.add('key4', 'v4')).toEqual(true)
    expect(df2.get()).toMatchObject({
      key4: 'v4'
    })
  })

  it('should create a circularArray dataField', function () {
    expect(function () {
      return new DataField({
        name: 'cyArray',
        schema: {
          type: 'array'
        }
      })
    }).toThrow()

    expect(function () {
      return new DataField({
        name: 'cyArray',
        schema: {
          type: 'circularArray'
        },
        value: {}
      })
    }).toThrow('notAnArray')

    expect(function () {
      return new DataField({
        name: 'cyArray',
        schema: {
          type: 'circularArray',
          default: ['']
        }
      })
    }).toThrow('noMaxAttribute')

    expect(function () {
      return new DataField({
        name: 'cyArray',
        schema: {
          type: 'circularArray',
          max: 0
        },
        value: []
      })
    }).toThrow('noMaxAttribute')

    expect(function () {
      return new DataField({
        name: 'cyArray',
        schema: {
          type: 'circularArray',
          max: 3
        },
        value: [1, 2, 3, 4]
      })
    }).toThrow('arrayMax')

    const df2 = new DataField({
      name: 'cyArray',
      schema: {
        type: 'circularArray',
        max: 3
      },
      value: [1, 2]
    })

    expect(df2.add(5)).toEqual(true)
    expect(df2.get()).toMatchObject([1, 2, 5])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([2, 5])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([5])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([])

    expect(df2.remove()).toEqual(true)
    expect(df2.get()).toMatchObject([])

    const df3 = new DataField({
      name: 'cyArray',
      schema: {
        type: 'circularArray',
        arrayDirection: 'top',
        max: 3
      },
      value: [1, 2]
    })

    expect(df3.add(5)).toEqual(true)
    expect(df3.get()).toMatchObject([5, 1, 2])

    expect(df3.add(7)).toEqual(true)
    expect(df3.get()).toMatchObject([7, 5, 1])

    expect(df3.add(9)).toEqual(true)
    expect(df3.get()).toMatchObject([9, 7, 5])

    df3.unset()
    expect(df3.get()).toEqual(null)
    expect(df3.get()).not.toEqual(undefined)

    expect(df3.add(9)).toEqual(true)
    expect(df3.get()).toMatchObject([9])
  })

  it('should create a complex dataField', function () {
    const defaultValue = {
      id: 32,
      name: 'abcde12345',
      status: true,
      nested: {
        id: 42,
        name: 'fghil67890',
        status: false,
        listing: [
          'elm1',
          'elm2'
        ]
      }
    }

    const dataField1 = new DataField({
      name: 'fieldname1',
      schema: {
        type: 'object',
        props: {
          id: { type: 'number', positive: true, integer: true },
          name: { type: 'string', min: 3, max: 255 },
          status: 'boolean',
          nested: {
            type: 'object',
            props: {
              id: { type: 'number', positive: true, integer: true },
              name: { type: 'string', min: 3, max: 255 },
              status: 'boolean',
              listing: { type: 'array' }
            }
          }
        }
      },
      value: defaultValue
    })

    // defaultValue.id = 1234
    // expect(dataField1.get()).not.toMatchObject(defaultValue)

    expect(function () { dataField1.set({ invalid: 'value' }) }).toThrow()

    const defaultValue1 = _.cloneDeep(defaultValue)
    defaultValue1.nested.listing = false
    expect(function () { dataField1.set(defaultValue1) }).toThrow()

    dataField1.unset()
    expect(dataField1.get()).toEqual(null)
    expect(dataField1.get()).not.toEqual(undefined)

    dataField1.set(defaultValue)
    expect(dataField1.get()).toMatchObject(defaultValue)

    try {
      dataField1.set({})
    } catch (e) {
      expect(e).toHaveProperty('errors')
      expect(e).toHaveProperty('message')

      expect(e.errors[0]).toHaveProperty('type')
      expect(e.errors[0]).toHaveProperty('expected')
      expect(e.errors[0]).toHaveProperty('actual')
      expect(e.errors[0]).toHaveProperty('field')
      expect(e.errors[0]).toHaveProperty('message')

      expect(e.getByType('required') instanceof Array).toEqual(true)
      expect(e.getByField('id') instanceof Array).toEqual(true)
      expect(e.getByType('required')[0].field).toEqual('fieldname1.id')
      expect(e.getByField('id')[0].field).toEqual('fieldname1.id')
    }
  })

  it('should fail because of strict checks', function () {
    const defaultValue = {
      id: 32,
      name: 'abcde12345',
      status: true,
      nested: {
        id: 42,
        name: 'fghil67890',
        status: false,
        listing: [
          'elm1',
          'elm2'
        ]
      }
    }

    const dataField1 = new DataField({
      name: 'fieldname1',
      schema: {
        type: 'object',
        props: {
          id: { type: 'number', positive: true, integer: true },
          name: { type: 'string', min: 3, max: 255 },
          status: 'boolean',
          nested: {
            type: 'object',
            props: {
              id: { type: 'number', positive: true, integer: true },
              name: { type: 'string', min: 3, max: 255 },
              status: 'boolean',
              listing: { type: 'array' }
            }
          },
          $$strict: true
        },
        default: defaultValue
      }
    })

    expect(dataField1.get()).toEqual(null)
    expect(dataField1.get(false)).toEqual(null)

    dataField1.set(defaultValue)
    expect(dataField1.get()).toMatchObject(defaultValue)
    expect(dataField1.get(false)).toMatchObject(defaultValue)

    defaultValue.extra = 'abc'
    expect(function () { dataField1.set(defaultValue) }).toThrow()
  })

  it('should manage absDirPath fields', function () {
    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'absDirPath', checkExists: false, createIfNotExists: false, deleteIfExists: false },
        value: path.join('.', 'abc', 'file_utils_test_dirx')
      })
    }).toThrow('notAbsDirPath')

    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'absDirPath', checkExists: true, createIfNotExists: false, deleteIfExists: false },
        value: path.join(__dirname, 'file_utils_test_dirx')
      })
    }).toThrow('dirNotExists')

    expect(function () {
      fileUtils.copyDirectorySync(path.join(__dirname, 'file_utils_test_dir'), path.join(__dirname, 'file_utils_test_dir2'))
      newDataField({
        name: 'fieldname1',
        schema: { type: 'absDirPath', checkExists: false, createIfNotExists: false, deleteIfExists: true },
        value: path.join(__dirname, 'file_utils_test_dir2')
      })
    }).not.toThrow()
    expect(fileUtils.directoryExistsSync(path.join(__dirname, 'file_utils_test_dir2'))).toEqual(false)

    const field2 = newDataField({
      name: 'fieldname1',
      schema: { type: 'absDirPath', checkExists: false, createIfNotExists: true, deleteIfExists: true },
      value: path.join(__dirname, 'file_utils_test_dir3')
    })
    expect(fileUtils.directoryExistsSync(path.join(__dirname, 'file_utils_test_dir3'))).toEqual(true)
    expect(fileUtils.removeDirSync(path.join(__dirname, 'file_utils_test_dir3'))).toEqual(true)

    field2.unset()
    expect(field2.get()).toEqual(null)
    expect(field2.get()).not.toEqual(undefined)

    field2.set(path.join(__dirname, 'file_utils_test_dir3'))
    expect(field2.get()).toEqual(path.join(__dirname, 'file_utils_test_dir3'))
    expect(fileUtils.removeDirSync(path.join(__dirname, 'file_utils_test_dir3'))).toEqual(true)
  })

  it('should manage absFilePath fields', function () {
    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'absFilePath', checkExists: false, createIfNotExists: false, deleteIfExists: false },
        value: path.join('.', 'abc', 'file_utils_test_dir', 'file1.json')
      })
    }).toThrow('notAbsFilePath')

    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'absFilePath', checkExists: true, createIfNotExists: false, deleteIfExists: false },
        value: path.join(__dirname, 'file_utils_test_dir', 'file1.jsonx')
      })
    }).toThrow('fileNotExists')

    expect(function () {
      const df1 = newDataField({
        name: 'fieldname1',
        schema: { type: 'number', readOnly: true },
        value: 32
      })
      df1.set(42)
    }).toThrow('is read-only')

    expect(function () {
      fileUtils.copyFileSync(path.join(__dirname, 'file_utils_test_dir', 'file1.json'), path.join(__dirname, 'file_utils_test_dir/file1_2.json'))
      newDataField({
        name: 'fieldname1',
        schema: { type: 'absFilePath', checkExists: false, createIfNotExists: false, deleteIfExists: true },
        value: path.join(__dirname, 'file_utils_test_dir', 'file1_2.json')
      })
    }).not.toThrow()
    expect(fileUtils.fileExistsSync(path.join(__dirname, 'file_utils_test_dir', 'file1_2.json'))).toEqual(false)

    const field2 = newDataField({
      name: 'fieldname1',
      schema: { type: 'absFilePath', checkExists: false, createIfNotExists: true, deleteIfExists: true },
      value: path.join(__dirname, 'file_utils_test_dir', 'file1_3.json')
    })
    expect(fileUtils.fileExistsSync(path.join(__dirname, 'file_utils_test_dir', 'file1_3.json'))).toEqual(true)
    expect(fileUtils.removeFileSync(path.join(__dirname, 'file_utils_test_dir', 'file1_3.json'))).toEqual(true)

    field2.unset()
    expect(field2.get()).toEqual(null)
    expect(field2.get()).not.toEqual(undefined)

    field2.set(path.join(__dirname, 'file_utils_test_dir', 'file1_3.json'))
    expect(field2.get()).toEqual(path.join(__dirname, 'file_utils_test_dir', 'file1_3.json'))
  })

  it('should manage relDirPath fields', function () {
    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
        value: path.join(baseRoot, 'abc', 'file_utils_test_dirx')
      })
    }).toThrow('notRelDirPath')

    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'relDirPath', basePath: path.join('.', 'invalid', 'base', 'path'), checkExists: false, createIfNotExists: false, deleteIfExists: false },
        value: path.join('.', 'abc', 'file_utils_test_dirx')
      })
    }).toThrow('invalidBasePath')

    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'relDirPath', basePath: __dirname, checkExists: true, createIfNotExists: false, deleteIfExists: false },
        value: path.join('.', 'abc', 'file_utils_test_dirx')
      })
    }).toThrow('dirNotExists')

    expect(function () {
      const dataField1 = newDataField({
        name: 'fieldname1',
        schema: {
          type: 'relDirPath',
          basePath: __dirname,
          checkExists: true,
          createIfNotExists: false,
          deleteIfExists: true,
          default: path.join('.', 'abc')
        }
      })

      dataField1.get()
    }).not.toThrow()

    fileUtils.copyDirectorySync(path.join(__dirname, 'file_utils_test_dir'), path.join(__dirname, 'file_utils_test_dir2'))
    newDataField({
      name: 'fieldname1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: true, createIfNotExists: false, deleteIfExists: true },
      value: path.join('.', 'file_utils_test_dir2')
    })
    expect(fileUtils.directoryExistsSync(path.join(__dirname, 'file_utils_test_dir2'))).toEqual(false)

    newDataField({
      name: 'fieldname1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: true },
      value: path.join('.', 'file_utils_test_dir3')
    })
    expect(fileUtils.directoryExistsSync(path.join(__dirname, 'file_utils_test_dir3'))).toEqual(true)
    expect(fileUtils.removeDirSync(path.join(__dirname, 'file_utils_test_dir3'))).toEqual(true)

    const field1 = newDataField({
      name: 'fieldname1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: path.join('.', 'file_utils_test_dir')
    })
    expect(field1.get()).toEqual(path.join(__dirname, 'file_utils_test_dir'))
    expect(field1.get(false)).toEqual(path.join('.', 'file_utils_test_dir'))
    expect(field1.set(path.join('.', 'file_utils_test_dir2'))).toEqual(true)
    expect(field1.get()).toEqual(path.join(__dirname, 'file_utils_test_dir2'))
    expect(field1.get(false)).toEqual(path.join('.', 'file_utils_test_dir2'))

    const field2 = newDataField({
      name: 'fieldname2',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: 'file_utils_test_dir'
    })
    expect(field2.get()).toEqual(path.join(__dirname, '.', 'file_utils_test_dir'))
    expect(field2.get(false)).toEqual('file_utils_test_dir')

    field2.unset()
    expect(field2.get()).toEqual(null)
    expect(field2.get()).not.toEqual(undefined)

    field2.set('file_utils_test_dir')
    expect(field2.get()).toEqual(path.join(__dirname, './file_utils_test_dir'))
  })

  it('should manage relFilePath fields', function () {
    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
        value: path.join(baseRoot, 'abc', 'file_utils_test_dir', 'file1.json')
      })
    }).toThrow('notRelFilePath')

    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'relFilePath', basePath: path.join('.', 'invalid', 'base', 'path'), checkExists: false, createIfNotExists: false, deleteIfExists: false },
        value: path.join('.', 'abc', 'file_utils_test_dirx')
      })
    }).toThrow('invalidBasePath')

    expect(function () {
      newDataField({
        name: 'fieldname1',
        schema: { type: 'relFilePath', basePath: __dirname, checkExists: true, createIfNotExists: false, deleteIfExists: false },
        value: path.join('.', 'file_utils_test_dir', 'file1.jsonx')
      })
    }).toThrow('fileNotExists')

    const dataField1 = newDataField({
      name: 'fieldname1',
      schema: { type: 'relFilePath', default: path.join('.'), basePath: __dirname, checkExists: true, createIfNotExists: false, deleteIfExists: true }
    })
    expect(dataField1.get()).toEqual(null)
    expect(dataField1.get(false)).toEqual(null)

    fileUtils.copyFileSync(path.join(__dirname, 'file_utils_test_dir', 'file1.json'), path.join(__dirname, 'file_utils_test_dir/file1_2.json'))
    newDataField({
      name: 'fieldname1',
      schema: { type: 'relFilePath', basePath: __dirname, checkExists: true, createIfNotExists: false, deleteIfExists: true },
      value: path.join('.', 'file_utils_test_dir', 'file1_2.json')
    })
    expect(fileUtils.fileExistsSync(path.join(__dirname, 'file_utils_test_dir', 'file1_2.json'))).toEqual(false)

    expect(fileUtils.removeFileSync(path.join(__dirname, 'file_utils_test_dir', 'file1_3.json'))).toEqual(true)
    newDataField({
      name: 'fieldname1',
      schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: true },
      value: path.join('.', 'file_utils_test_dir', 'file1_3.json')
    })
    expect(fileUtils.fileExistsSync(path.join(__dirname, 'file_utils_test_dir', 'file1_3.json'))).toEqual(true)
    expect(fileUtils.removeFileSync(path.join(__dirname, 'file_utils_test_dir', 'file1_3.json'))).toEqual(true)

    const field1 = newDataField({
      name: 'fieldname1',
      schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: path.join('.', 'file_utils_test_dir', 'file1.json')
    })
    expect(field1.get()).toEqual(path.join(__dirname, 'file_utils_test_dir', 'file1.json'))
    expect(field1.get(false)).toEqual(path.join('.', 'file_utils_test_dir', 'file1.json'))
    expect(field1.set(path.join('.', 'file_utils_test_dir', 'file1_2.json'))).toEqual(true)
    expect(field1.get()).toEqual(path.join(__dirname, 'file_utils_test_dir', 'file1_2.json'))
    expect(field1.get(false)).toEqual(path.join('.', 'file_utils_test_dir', 'file1_2.json'))

    const field2 = newDataField({
      name: 'fieldname2',
      schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: path.join('file_utils_test_dir', 'file1.json')
    })
    expect(field2.get()).toEqual(path.join(__dirname, '.', 'file_utils_test_dir', 'file1.json'))
    expect(field2.get(false)).toEqual(path.join('file_utils_test_dir', 'file1.json'))

    field2.unset()
    expect(field2.get()).toEqual(null)
    expect(field2.get()).not.toEqual(undefined)

    field2.set(path.join('file_utils_test_dir', 'file1.json'))
    expect(field2.get()).toEqual(path.join(__dirname, '.', 'file_utils_test_dir', 'file1.json'))
  })
})