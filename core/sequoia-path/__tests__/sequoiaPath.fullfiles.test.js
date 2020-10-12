const path = require('path')
const { SequoiaPath } = require('../index')
const fileUtils = require('../file.utils')

describe('SequoiaPath object with a full tree', function () {
  it('should load a full file', async function () {
    const sq = new SequoiaPath()
    sq.options({
      filePath: path.join(__dirname, 'test_temp', 'test_dir_export.json')
    })
    await expect(sq.load()).resolves.toEqual(true)
    expect(sq.empty).toEqual(false)
    expect(sq.nodeCount).toEqual(18)
    expect(sq.fileCount).toEqual(13)
    expect(sq.directoryCount).toEqual(5)
  })

  it('should save a full file', async function () {
    const sq = new SequoiaPath(path.join(__dirname, 'test_temp', 'directory2'))
    sq.options({
      filePath: path.join(__dirname, 'test_temp', 'dir2_export.json')
    })
    await sq.clean()
    await expect(sq.scan()).resolves.toEqual(true)
    expect(sq.nodeCount).toEqual(3)
    expect(sq.fileCount).toEqual(2)
    expect(sq.directoryCount).toEqual(1)
    await expect(sq.save()).resolves.toEqual(true)

    const jsonData = await fileUtils.readJsonFile(sq.data.options.filePath)
    expect(jsonData.data.rootPath).toEqual(sq.rootPath)
    expect(jsonData.data.filesCount).toEqual(2)
    expect(jsonData.data.directoriesCount).toEqual(1)
    expect(jsonData.struct.length).toEqual(3)
    await sq.clean()
  })
})
