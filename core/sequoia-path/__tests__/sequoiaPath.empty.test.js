const path = require('path')
const { SequoiaPath } = require('../index')
const fileUtils = require('../file.utils')

const TestTempDirectory = path.join(__dirname, 'test_temp')
const TestEmptyDirectory = path.join(__dirname, 'test_temp', 'empty-dir')

describe('SequoiaPath empty objects', function () {
  it('should throw some errors', async function () {
    expect(function () {
      return new SequoiaPath('not-abs-path')
    }).toThrow('Tree\'s root path must be an absolute path')

    expect(function () {
      const sq = new SequoiaPath(TestTempDirectory)
      const ObjectClass = class WrongObject { }
      sq.options({ ObjectClass })
    }).toThrow('should extend PathInfo class')

    expect(function () {
      const sq = new SequoiaPath(TestTempDirectory)
      const filePath = 'not-abs-path'
      sq.options({ filePath })
    }).toThrow('filePath must be an absolute path')

    await expect((async function () {
      const sq = new SequoiaPath(path.join(__dirname, 'not-exists'))
      await sq.scan()
    })()).rejects.toThrow('Tree\'s root path does not exist')

    await expect((async function () {
      const sq = new SequoiaPath()
      await sq.load()
    })()).rejects.toThrow('No file associated to this tree')

    await expect((async function () {
      const sq = new SequoiaPath()
      await sq.save()
    })()).rejects.toThrow('No file associated to this tree')
  })

  it('should work correctly when it is a new empty object', async function () {
    const sq = new SequoiaPath()
    expect(sq.empty).toEqual(true)
    expect(sq.rootPath).toEqual(undefined)

    await expect((async () => { await sq.scan() })()).rejects.toThrow('Tree\'s root path does not exist')
    await expect((async () => { await sq.load() })()).rejects.toThrow('No file associated to this tree')
    await expect((async () => { await sq.save() })()).rejects.toThrow('No file associated to this tree')
    await checkEmptySequoiaPath(sq)
    await expect(sq.clean()).resolves.toEqual(true)
  })

  it('should be empty after reading an empty directory', async function () {
    const sq = new SequoiaPath(TestEmptyDirectory)
    await sq.scan({
      filterFn: (item) => {
        if (item.name === 'skipped-file') return false
      }
    })
    await checkEmptySequoiaPath(sq)
    await expect(sq.clean()).resolves.toEqual(true)
  })

  it('should be empty when it loads an empty json', async function () {
    const sq = new SequoiaPath()
    sq.options({
      filePath: path.join(TestTempDirectory, 'empty-json.json')
    })
    await expect(sq.load()).resolves.toEqual(false)
    await checkEmptySequoiaPath(sq)
  })

  it('should be empty when it loads a not-valid json for SequoiaPath', async function () {
    const sq = new SequoiaPath()
    sq.options({
      filePath: path.join(__dirname, 'test_dir', 'not-for-sequoia-path.json')
    })
    await expect(sq.load()).resolves.toEqual(false)
    await checkEmptySequoiaPath(sq)
  })

  it('should not save a file (or remove it) when saving an empty tree', async function () {
    const sq = new SequoiaPath(TestEmptyDirectory)
    sq.options({
      filePath: path.join(__dirname, 'test_dir', 'not-save.json')
    })
    await fileUtils.writeJsonFile(sq.data.options.filePath, {})
    await sq.scan({
      filterFn: (item) => {
        if (item.name === 'skipped-file') return false
      }
    })
    await expect(sq.save()).resolves.toEqual(false)
    await expect(fileUtils.fileExists(sq.data.options.filePath)).resolves.toEqual(false)
    await checkEmptySequoiaPath(sq)
  })
})

const checkEmptySequoiaPath = async (sq) => {
  expect(sq.nodeCount).toEqual(0)
  expect(sq.fileCount).toEqual(0)
  expect(sq.directoryCount).toEqual(0)

  expect(sq.toJson()).toEqual(null)
  expect(sq.fromJson(null)).toEqual(false)
  expect(sq.isEqualTo(null)).toEqual(false)
  expect(sq.isEqualTo(new SequoiaPath())).toEqual(false)

  let walkFlag = false
  sq.walk({ itemFn: () => { walkFlag = true } })
  expect(walkFlag).toEqual(false) /* itemFn should be never called */

  let foreachFlag = false
  sq.forEach({ itemFn: () => { foreachFlag = true } })
  expect(foreachFlag).toEqual(false) /* itemFn should be never called */

  let printFlag = false
  sq.print({ itemFn: () => { printFlag = true } })
  expect(printFlag).toEqual(false) /* itemFn should be never called */
}
