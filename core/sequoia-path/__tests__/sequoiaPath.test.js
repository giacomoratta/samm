const path = require('path')
const { SequoiaPath } = require('../index')

const SamplesDirectory = path.join(__dirname, 'test_dir')

describe('SequoiaPath class and object', function () {
  beforeAll(function () {})
  afterAll(function () {})

  it('should check an empty SequoiaPath', async function () {
    const sq = new SequoiaPath()
    // todo: check internal status and methods
    expect(sq.empty).toEqual(true)
    expect(sq.rootPath).toEqual(undefined)
    expect(sq.nodeCount).toEqual(0)
    expect(sq.fileCount).toEqual(0)
    expect(sq.directoryCount).toEqual(0)

    await expect(sq.clean()).resolves.toEqual(true)
    await expect((async () => { await sq.read() })()).rejects.toThrow('Tree\'s root path does not exist')
    await expect((async () => { await sq.load() })()).rejects.toThrow('No file associated to this tree')
    await expect((async () => { await sq.save() })()).rejects.toThrow('No file associated to this tree')

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
  })

  it('should have empty values when tree is not loaded', async function () {})
  it('should read simple directory', async function () {})
  it('should read from empty json', async function () {})
  it('should match two equal trees', async function () {})
  it('should loop on a tree', async function () {})
  it('should walk in a tree', async function () {})

  it('should load an empty file', async function () {})
  it('should load a full file', async function () {})

  it('should not save an empty file and remove it', async function () {})
  it('should save a full file', async function () {})

  it('should throw some errors', async function () {
    expect(function () {
      return new SequoiaPath('not-abs-path')
    }).toThrow('Tree\'s root path must be an absolute path')

    expect(function () {
      const sq = new SequoiaPath(SamplesDirectory)
      const ObjectClass = class WrongObject { }
      sq.options({ ObjectClass })
    }).toThrow('should extend PathInfo class')

    expect(function () {
      const sq = new SequoiaPath(SamplesDirectory)
      const filePath = 'not-abs-path'
      sq.options({ filePath })
    }).toThrow('filePath must be an absolute path')

    await expect((async function () {
      const sq = new SequoiaPath(path.join(__dirname, 'not-exists'))
      await sq.read()
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
})
