const path = require('path')
const { DataField } = require('../index')
const baseRoot = path.parse(__dirname).root

describe('dataField path fields', function () {
  it('should support a path as default value', function () {
    const field1Attr = {
      name: 'fieldName1',
      schema: {
        type: 'absDirPath',
        checkExists: true,
        createIfNotExists: false,
        deleteIfExists: false,
        default: path.join(baseRoot,'abc','file_utils_test_dir')
      }
    }
    const field1 = new DataField(field1Attr)
    expect(field1.get()).toEqual(null)
    field1.set(path.join(__dirname, 'file_utils_test_dir'))
    expect(field1.get()).toEqual(path.join(__dirname, 'file_utils_test_dir'))

    const field2Attr = {
      name: 'fieldName2',
      schema: {
        type: 'absFilePath',
        checkExists: true,
        createIfNotExists: false,
        deleteIfExists: false,
        default: path.join(baseRoot,'abc','file_utils_test_file')
      }
    }
    const field2 = new DataField(field2Attr)
    expect(field2.get()).toEqual(null)
    field2.set(path.join(__dirname, 'file_utils_test_dir', 'file1.json'))
    expect(field2.get()).toEqual(path.join(__dirname, 'file_utils_test_dir', 'file1.json'))

    const field3Attr = {
      name: 'fieldName3',
      schema: {
        type: 'relDirPath',
        checkExists: true,
        createIfNotExists: false,
        deleteIfExists: false,
        basePath: __dirname,
        default: path.join('abc','file_utils_test_dir')
      }
    }
    const field3 = new DataField(field3Attr)
    expect(field3.get()).toEqual(null)
    field3.set('file_utils_test_dir')
    expect(field3.get()).toEqual(path.join(__dirname, 'file_utils_test_dir'))

    const field4Attr = {
      name: 'fieldName4',
      schema: {
        type: 'relFilePath',
        checkExists: true,
        createIfNotExists: false,
        deleteIfExists: false,
        basePath: __dirname,
        default: path.join('abc','file_utils_test_file')
      }
    }
    const field4 = new DataField(field4Attr)
    expect(field4.get()).toEqual(null)
    field4.set(path.join('file_utils_test_dir', 'file1.json'))
    expect(field4.get()).toEqual(path.join(__dirname, 'file_utils_test_dir', 'file1.json'))
  })

  it('should change schema.basePath of a relDirPath field', function () {
    const field1Attr = {
      name: 'fieldName1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: path.join('abc', 'file_utils_test_dir')
    }
    const field1AttrChange1 = {
      basePath: path.join(__dirname, 'NEW')
    }

    const field1 = new DataField(field1Attr)
    expect(field1.get()).toEqual(path.join(__dirname, 'abc', 'file_utils_test_dir'))

    field1.changeSchema(field1AttrChange1)
    expect(field1.get()).toEqual(path.join(__dirname, 'NEW', 'abc', 'file_utils_test_dir'))

    const field2Attr = {
      name: 'fieldName1',
      schema: {
        type: 'array',
        items: {
          type: 'relDirPath',
          basePath: __dirname
        }
      },
      value: [
        'samplePack1',
        'samplePack2'
      ]
    }
    const field2AttrChange1 = {
      items: {
        basePath: path.join(__dirname, 'NEW')
      }
    }

    const field2 = new DataField(field2Attr)
    expect(field2.get()).toMatchObject([
      path.join(__dirname, 'samplePack1'),
      path.join(__dirname, 'samplePack2')
    ])

    field2.changeSchema(field2AttrChange1)
    expect(field2.get()).toMatchObject([
      path.join(__dirname, 'NEW', 'samplePack1'),
      path.join(__dirname, 'NEW', 'samplePack2')
    ])

    const field3Attr = {
      name: 'fieldName1',
      schema: {
        type: 'object',
        props: {
          path123: {
            type: 'relDirPath',
            basePath: __dirname
          },
          path456: {
            type: 'array',
            items: {
              type: 'relDirPath',
              basePath: __dirname
            }
          }
        }
      },
      value: {
        path123: 'samplePack1',
        path456: [
          'samplePack42',
          'samplePack43',
          'samplePack44'
        ]
      }
    }
    const field3AttrChange1 = {
      props: {
        path123: {
          basePath: path.join(__dirname, 'NEW')
        },
        path456: {
          items: {
            basePath: path.join(__dirname, 'NEW')
          }
        }
      }
    }

    const field3 = new DataField(field3Attr)
    expect(field3.get()).toMatchObject({
      path123: path.join(__dirname, 'samplePack1'),
      path456: [
        path.join(__dirname, 'samplePack42'),
        path.join(__dirname, 'samplePack43'),
        path.join(__dirname, 'samplePack44')
      ]
    })

    field3.changeSchema(field3AttrChange1)
    expect(field3.get()).toMatchObject({
      path123: path.join(__dirname, 'NEW', 'samplePack1'),
      path456: [
        path.join(__dirname, 'NEW', 'samplePack42'),
        path.join(__dirname, 'NEW', 'samplePack43'),
        path.join(__dirname, 'NEW', 'samplePack44')
      ]
    })
  })

  it('should change schema.basePath of a relFilePath field', function () {
    const field1Attr = {
      name: 'fieldName1',
      schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: path.join('abc', 'file_utils_test_dir', 'file1.json')
    }
    const field1AttrChange1 = {
      basePath: path.join(__dirname, 'NEW')
    }

    const field1 = new DataField(field1Attr)
    expect(field1.get()).toEqual(path.join(__dirname, 'abc', 'file_utils_test_dir', 'file1.json'))

    field1.changeSchema(field1AttrChange1)
    expect(field1.get()).toEqual(path.join(__dirname, 'NEW', 'abc', 'file_utils_test_dir', 'file1.json'))

    const field2Attr = {
      name: 'fieldName1',
      schema: {
        type: 'array',
        items: {
          type: 'relFilePath',
          basePath: __dirname
        }
      },
      value: [
        path.join('samplePack1', 'file1.json'),
        path.join('samplePack2', 'file1.json')
      ]
    }
    const field2AttrChange1 = {
      items: {
        basePath: path.join(__dirname, 'NEW')
      }
    }

    const field2 = new DataField(field2Attr)
    expect(field2.get()).toMatchObject([
      path.join(__dirname, 'samplePack1', 'file1.json'),
      path.join(__dirname, 'samplePack2', 'file1.json')
    ])

    field2.changeSchema(field2AttrChange1)
    expect(field2.get()).toMatchObject([
      path.join(__dirname, 'NEW', 'samplePack1', 'file1.json'),
      path.join(__dirname, 'NEW', 'samplePack2', 'file1.json')
    ])

    const field3Attr = {
      name: 'fieldName1',
      schema: {
        type: 'object',
        props: {
          path123: {
            type: 'relFilePath',
            basePath: __dirname
          },
          path456: {
            type: 'array',
            items: {
              type: 'relFilePath',
              basePath: __dirname
            }
          }
        }
      },
      value: {
        path123: path.join('samplePack1', 'file1.json'),
        path456: [
          path.join('samplePack42', 'file1.json'),
          path.join('samplePack43', 'file1.json'),
          path.join('samplePack44', 'file1.json')
        ]
      }
    }
    const field3AttrChange1 = {
      props: {
        path123: {
          basePath: path.join(__dirname, 'NEW')
        },
        path456: {
          items: {
            basePath: path.join(__dirname, 'NEW')
          }
        }
      }
    }

    const field3 = new DataField(field3Attr)
    expect(field3.get()).toMatchObject({
      path123: path.join(__dirname, 'samplePack1', 'file1.json'),
      path456: [
        path.join(__dirname, 'samplePack42', 'file1.json'),
        path.join(__dirname, 'samplePack43', 'file1.json'),
        path.join(__dirname, 'samplePack44', 'file1.json')
      ]
    })

    field3.changeSchema(field3AttrChange1)
    expect(field3.get()).toMatchObject({
      path123: path.join(__dirname, 'NEW', 'samplePack1', 'file1.json'),
      path456: [
        path.join(__dirname, 'NEW', 'samplePack42', 'file1.json'),
        path.join(__dirname, 'NEW', 'samplePack43', 'file1.json'),
        path.join(__dirname, 'NEW', 'samplePack44', 'file1.json')
      ]
    })
  })
})
