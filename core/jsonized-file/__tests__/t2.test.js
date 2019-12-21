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
})
