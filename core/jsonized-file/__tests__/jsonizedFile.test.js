const path = require('path')
const { fileUtils } = require('../../utils/file.utils') // todo: remove
const { JsonizedFile } = require('../index')

const jsonFileWrongJson = path.join(__dirname, 'test_dir', 'config_file_wrong_json')
const jsonFileEmpty = path.join(__dirname, 'test_dir', 'config_file_empty')
const jsonFileNotExists = path.join(__dirname, 'test_dir', 'config_file_not_exists')

describe('JsonizedFile operations with fields and json data', function () {
  beforeAll(function () {
    // add, remove, etc. many fields
  })

  it('should perform basic operations with fields', async function () { })

  it('should handle check and give information about fields', async function () { })

  it('should avoid to create existent fields', async function () { })

  it('should handle operations with non-existent fields', async function () { })

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

  it('should load valid json file', async function () { })

  it('should save empty json file', async function () { })

  it('should save valid json file', async function () { })

  it('should check and clean data', async function () { })

  it('should reset a json file', async function () { })
})
