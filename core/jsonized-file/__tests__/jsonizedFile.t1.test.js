const { JsonizedFile } = require('../index')
const jszFile1 = new JsonizedFile({ filePath:'/fake/dir' })

describe('JsonizedFile class and object', function () {
  it('should create an basic JsonizedFile with simple fields', function () {
    expect(function () {
      jszFile1.addField({
        name: 'counter1',
        schema: { type: 'number', positive: true, integer: true },
        value: 32
      })
    }).not.toThrow()

    expect(function () { jszFile1.removeField('counter2') }).not.toThrow()

    expect(function () {
      jszFile1.addField({
        name: 'counter1',
        schema: { type: 'string' },
        value: 'abcde'
      })
    }).toThrow('already exists')

    expect(function () {
      jszFile1.addField({
        name: 'counter2',
        schema: { type: 'number', positive: false, integer: true },
        value: -12
      })
    }).not.toThrow()

    expect(function () { jszFile1.removeField('counter2') }).not.toThrow()
    expect(jszFile1.get('counter2')).toEqual(undefined)
    expect(jszFile1.getField('counter2')).toEqual(undefined)

    expect(jszFile1.get('counter1')).toEqual(32)

    const counter1Field = jszFile1.getField('counter1')

    expect(counter1Field).toBeInstanceOf(Object)
    expect(counter1Field.get()).toEqual(32)

    const onChangeData = { fieldAttr: null }
    counter1Field.on('change', function (fieldAttr) {
      onChangeData.fieldAttr = fieldAttr
    })

    jszFile1.set('counter1', 42)
    expect(onChangeData.fieldAttr.fieldName).toEqual('counter1')
    expect(onChangeData.fieldAttr.newValue).toEqual(42)
    expect(onChangeData.fieldAttr.oldValue).toEqual(32)

    expect(function () {
      jszFile1.addField({
        name: 'counter1_wrong',
        schema: { type: 'number', positive: true, integer: true },
        value: -32
      })
    }).toThrow('numberPositive')

    expect(jszFile1.get('counter1_wrong')).toEqual(undefined)

    // expect(myConfig.isValid()).toEqual(false)
  })

  it('should create an basic JsonizedFile with complex fields', function () {
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

    expect(function () {
      jszFile1.addField({
        name: 'person1',
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
    }).not.toThrow()

    // defaultValue.id = 1234
    // expect(jszFile1.get('person1')).not.toMatchObject(defaultValue)
  })

  it('should create an basic JsonizedFile with absPath fields', function () {
    const path = require('path')
    const fileUtils = require('../../utils/file.utils')

    expect(function () {
      jszFile1.addField({
        name: 'absDir1',
        schema: { type: 'absDirPath', checkExists: false, createIfNotExists: true, deleteIfExists: false },
        value: path.join(__dirname, 'file_utils_test_dir1')
      })
    }).not.toThrow()

    expect(fileUtils.directoryExistsSync(jszFile1.get('absDir1'))).toEqual(true)

    expect(function () {
      jszFile1.addField({
        name: 'absFile1',
        schema: { type: 'absFilePath', checkExists: false, createIfNotExists: true, deleteIfExists: false },
        value: path.join(__dirname, 'file_utils_test_dir1/file1.json')
      })
    }).not.toThrow()

    expect(fileUtils.fileExistsSync(jszFile1.get('absFile1'))).toEqual(true)

    fileUtils.removeDirSync(jszFile1.get('absDir1'))
  })

  it('should create an basic JsonizedFile with relPath fields', function () {
    const fileUtils = require('../../utils/file.utils')

    expect(function () {
      jszFile1.addField({
        name: 'relDir1',
        schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: false },
        value: 'file_utils_test_dir2'
      })
    }).not.toThrow()

    expect(fileUtils.directoryExistsSync(jszFile1.get('relDir1'))).toEqual(true)

    expect(function () {
      jszFile1.addField({
        name: 'relFile1',
        schema: { type: 'relFilePath', basePath: __dirname, checkExists: false, createIfNotExists: true, deleteIfExists: false },
        value: 'file_utils_test_dir2/file2.json'
      })
    }).not.toThrow()

    expect(fileUtils.fileExistsSync(jszFile1.get('relFile1'))).toEqual(true)

    fileUtils.removeDirSync(jszFile1.get('relDir1'))
  })

  it('should get fields list and export a complete json object', function () {

    jszFile1.addField({
      name: 'null-field',
      schema: {
        type: 'array',
        items: 'number',
        default: [ 61, 53, 96 ]
      }
    })

    const exportObject = jszFile1.toObject()

    expect(exportObject).toMatchObject({
      counter1: 42,
      person1: {
        id: 32,
        name: 'abcde12345',
        status: true,
        nested: { id: 42, name: 'fghil67890', status: false, listing: ['elm1', 'elm2'] }
      },
      absDir1: '/home/giacomo/Workspace/mpl/core/jsonized-file/__tests__/file_utils_test_dir1',
      absFile1: '/home/giacomo/Workspace/mpl/core/jsonized-file/__tests__/file_utils_test_dir1/file1.json',
      relDir1: 'file_utils_test_dir2',
      relFile1: 'file_utils_test_dir2/file2.json'
    })

    const fieldList = jszFile1.getFieldList()

    expect(fieldList).toBeInstanceOf(Array)
    expect(fieldList).toMatchObject([
      'counter1',
      'person1',
      'absDir1',
      'absFile1',
      'relDir1',
      'relFile1',
      'null-field'
    ])
  })
})
