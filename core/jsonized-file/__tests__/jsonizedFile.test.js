const path = require('path')
const { fileUtils } = require('../../utils/file.utils') // todo: remove
const baseRoot = path.join(__dirname, 'test_dir')
const { JsonizedFile } = require('../index')

const jsonFileWrongJson = path.join(__dirname, 'test_dir', 'config_file_wrong_json')
const jsonFileEmpty = path.join(__dirname, 'test_dir', 'config_file_empty')
const jsonFileNotExists = path.join(__dirname, 'test_dir', 'config_file_not_exists')

describe('JsonizedFile operations with files', function () {
  it('should handle files with bad json', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileWrongJson })
    await expect(jzf.load()).resolves.toEqual(false)
  })

  it('should handle empty json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileEmpty })
    await expect(jzf.load()).resolves.toEqual(false)
  })

  it('should handle not-existent json file', async function () {
    const jzf = new JsonizedFile({ filePath: jsonFileNotExists })
    await expect(jzf.load()).resolves.toEqual(false)
  })

  it('should load a complex json file', async function () { })

  it('should save a complex json file', async function () { })

  it('should reset a complex json file', async function () { })

  it('should delete the json file', async function () { })
})

describe('JsonizedFile operations with fields and json data', function () {
  it('should handle simple fields', async function () { })

  it('should avoid to create existent fields', async function () { })

  it('should handle check and give information about fields', async function () { })

  it('should handle operations with non-existent fields', async function () { })

  it('should throw errors about values which do not match the schema', async function () { })

  it('should handle object fields', async function () { })

  it('should handle complex object fields', async function () { })

  it('should handle path fields', async function () { })
})
