const path = require('path')
const fileUtils = require('../../utils/file.utils')

const { JsonizedFile } = require('../index')

describe('JsonizedFile set file holder', function () {
  it('should set a file holder and load empty file', function () {
    const newJsonizedFile = function (filePath, prettyJson) { return new JsonizedFile({ filePath, prettyJson }) }

    expect(function () { return new JsonizedFile() }).toThrow('Cannot read')

    const f1 = newJsonizedFile()
    expect(function () { f1.load() }).toThrow('Missing \'filePath\'')

    const f2 = newJsonizedFile(path.join(__dirname, 'f1.json'))
    expect(function () { f2.load() }).not.toThrow('Missing \'filePath\'')
    expect(f2.fileHolder.config.fileType).toEqual('json-compact')

    const f3 = newJsonizedFile(path.join(__dirname, 'f1.json'), true)
    expect(function () { f3.load() }).not.toThrow('Missing \'filePath\'')
    expect(f3.fileHolder.config.fileType).toEqual('json')

    fileUtils.removeFileSync(path.join(__dirname, 'f1.json'))
  })
  it('should create a JsonizedFile and save on file', function () {
    fileUtils.copyFileSync(path.join(__dirname, 'test_dir', 'f0.example.json'), path.join(__dirname, 'test_dir', 'f1.example.json'))
    const f1 = new JsonizedFile({ filePath: path.join(__dirname, 'test_dir', 'f1.example.json'), prettyJson: true })

    f1.addField({
      name: 'field1',
      schema: {
        type: 'number', positive: true, integer: true
      },
      value: 32
    })

    f1.addField({
      name: 'field2',
      schema: {
        type: 'object',
        props: {
          id: { type: 'number', positive: true, integer: true },
          name: { type: 'string', min: 3, max: 255 },
          status: 'boolean'
        }
      },
      value: {
        id: 32,
        name: 'namefield2',
        status: false
      }
    })

    f1.addField({
      name: 'field31',
      schema: { type: 'absFilePath', checkExists: true, createIfNotExists: false, deleteIfExists: false },
      value: path.join(__dirname, 'test_dir', 'field31.json')
    })

    f1.addField({
      name: 'field32',
      schema: { type: 'relFilePath', basePath: path.join(__dirname, 'test_dir'), checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: 'field32.json'
    })

    f1.addField({
      name: 'field51',
      schema: { type: 'absDirPath', checkExists: true, createIfNotExists: false, deleteIfExists: false },
      value: path.join(__dirname, 'test_dir', 'field51')
    })

    f1.addField({
      name: 'field52',
      schema: { type: 'relDirPath', basePath: path.join(__dirname, 'test_dir'), checkExists: false, createIfNotExists: true, deleteIfExists: false },
      value: 'field52/field52sub'
    })

    // extra field
    f1.addField({
      name: 'field6',
      schema: {
        type: 'number'
      },
      value: -32.24524246
    })

    expect(function () { f1.load() }).not.toThrow()
    expect(function () { f1.save() }).not.toThrow()

    const jsonFile1 = fileUtils.readJsonFileSync(f1.filePath)
    expect(jsonFile1).toHaveProperty('field6')
    expect(jsonFile1).not.toHaveProperty('field7')

    f1.set('field1', 42)
    const field2 = f1.get('field2')
    field2.id = 52
    field2.name = 'namefield2mod'
    field2.status = true
    f1.set('field2', field2)
    expect(f1.save()).toEqual(true)

    const jsonFile3 = fileUtils.readJsonFileSync(f1.filePath)
    expect(jsonFile3.field1).toEqual(42)
    expect(jsonFile3.field2).toMatchObject({ id: 52, name: 'namefield2mod', status: true })

    f1.set('field1', 32)
    f1.set('field2', { id: 32, name: 'namefield2', status: false })
    expect(f1.save()).toEqual(true)

    const jsonFile2 = fileUtils.readJsonFileSync(f1.filePath)
    expect(jsonFile2.field1).toEqual(32)
    expect(jsonFile2.field2).toMatchObject({ id: 32, name: 'namefield2', status: false })
  })
})
