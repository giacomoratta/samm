const path = require('path')
const { DataFieldBuiltInFactory } = require('../../data-field/dataFieldBuiltIn.factory')
const { JsonizedFile } = require('../index')

const jsonTestDir = path.join(__dirname, 'test_dir')
const jsonFileWrongJson = path.join(jsonTestDir, 'config_file_wrong_json')
const jsonFileEmpty = path.join(jsonTestDir, 'config_file_empty')
const jsonFileNotExists = path.join(jsonTestDir, 'config_file_not_exists')

const DFBF = new DataFieldBuiltInFactory()

describe('JsonizedFile operations with fields and json data', function () {
  beforeAll(function () {
    DFBF.initFactory()
    // add, remove, etc. many fields
  })

  it('should load non-existent json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileNotExists })
    await expect(jzf.load()).resolves.toEqual(false)
  })

  it('should load empty json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileEmpty })
    await expect(jzf.load()).resolves.toEqual(false)
  })

  it('should load bad json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileWrongJson })
    await expect(jzf.load()).resolves.toEqual(false)
  })

  it('should save empty json file', async function () {
    const jsonFileEmpty2 = path.join(jsonTestDir, 'config_file_empty2')
    const jzf = new JsonizedFile({ filePath: jsonFileEmpty2 })
    await expect(jzf.load()).resolves.toEqual(false)
    await expect(jzf.save()).resolves.toEqual(true)
    expect(jzf.jsonData).toEqual(null)
  })

  it('should load bad json file and set correct internal data', async function () {
    const jzf = new JsonizedFile({
      filePath: path.join(jsonTestDir, 'config_file_wrong_json2'),
      cloneFrom: jsonFileWrongJson
    })
    await expect(jzf.load()).resolves.toEqual(false)
    expect(jzf.jsonData).toEqual(null)

    jzf.add(DFBF.create({
      name: 'username',
      schema: {
        type: 'string',
        min: 3
      },
      value: 'qwerty098'
    }))
    expect(jzf.jsonData).toEqual(null)

    await expect(jzf.save()).resolves.toEqual(true)
    expect(jzf.jsonData).toEqual({
      username: 'qwerty098'
    })

    await jzf.clean()
  })

  it('should perform a basic flow: load, edit, save, re-load', async function () {
    const jzf = new JsonizedFile({ filePath: path.join(jsonTestDir, 'basicFile1.json'), prettyJson: true })

    jzf.add(DFBF.create({
      name: 'username',
      schema: {
        type: 'string',
        min: 3
      },
      value: 'qwerty098'
    }))

    jzf.add(DFBF.create({
      name: 'age',
      schema: {
        type: 'number',
        min: 3
      },
      value: 32
    }))

    jzf.add(DFBF.create({
      name: 'optional1',
      schema: {
        type: 'string'
      }
    }))

    await expect(jzf.load()).resolves.toEqual(false)
    await jzf.save()

    expect(jzf.jsonData).toMatchObject({
      username: 'qwerty098',
      age: 32
    })

    jzf.field('optional1').value = 'test-not-null'
    await jzf.save()
    expect(jzf.jsonData).toMatchObject({
      username: 'qwerty098',
      age: 32,
      optional1: 'test-not-null'
    })

    await jzf.clean()
  })

  it('should handle check and give information about fields', async function () {
    // has
    // field
    // length
    // list
    // isEmpty
  })

  it('should avoid to create existent fields and remove it', async function () {
    // create x2
    // remove
  })

  it('should handle operations with non-existent fields', async function () {
    // has
    // field
    // isEmpty
    // remove
  })

  it('should reset a jsonizedFile object', async function () {
    // create 3 fields (1 absFilePath empty)
    // reset
    // file already there
  })

  it('should clean a jsonizedFile object', async function () {
    // create 3 fields (1 absFilePath empty)
    // clean
    // file removed
  })
})
