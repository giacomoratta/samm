const path = require('path')
const fileUtils = require('../../utils/file.utils')
/*
* T2
*
* load config file
* save config file
*/

/*
* set flags from outside
* set flags (in 'on' method of a field)
* check flags
* print flags
*
* */

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
    const f1 = new JsonizedFile({ filePath: path.join(__dirname, 'f1.example.json') })

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

    f1.load()
    expect(f1.toObject()).toMatchObject({ field1: 32, field2: { id: 32, name: 'namefield2', status: false } })

    f1.set('field1',42)
    const field2 = f1.get('field2')
    field2.id = 52
    field2.name = 'namefield2mod'
    field2.status = true
    f1.set('field2',field2)

    f1.save()
    expect(fileUtils.readJsonFileSync(f1.filePath)).toMatchObject({ field1: 42, field2: { id: 52, name: 'namefield2mod', status: true } })


    f1.set('field1',32)
    f1.set('field2',{ id: 32, name: 'namefield2', status: false })

    f1.save()
    expect(f1.toObject()).toMatchObject({ field1: 32, field2: { id: 32, name: 'namefield2', status: false } })
  })
})
