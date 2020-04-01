const path = require('path')
const { SequoiaPath } = require('../index')

const TestTempDirectory = path.join(__dirname, 'test_dir')

/* These 2 directories have the same files inside */
const TestDirD2 = path.join(__dirname, 'test_dir', 'directory1', 'directory2')
const TestDirT2 = path.join(__dirname, 'test_temp', 'directory2')

/* Main SequoiaPath object */
let sq = null

describe('SequoiaPath object', function () {
  beforeAll(async function () {
    sq = new SequoiaPath(TestTempDirectory)
    await expect(sq.scan()).resolves.toEqual(true)
  })

  it('should have a correct tree after reading simple directory', async function () {
    expect(sq.rootPath).toEqual(TestTempDirectory)
    expect(sq.empty).toEqual(false)
    expect(sq.nodeCount).toEqual(18)
    expect(sq.fileCount).toEqual(13)
    expect(sq.directoryCount).toEqual(5)
    expect(typeof sq.toJson() === 'object').toEqual(true)
  })

  it('should match two equal trees', async function () {
    const sq1 = new SequoiaPath(TestDirD2)
    await expect(sq1.scan()).resolves.toEqual(true)
    expect(sq1.nodeCount).toEqual(3)
    const sq2 = new SequoiaPath(TestDirD2)
    await expect(sq2.scan()).resolves.toEqual(true)
    expect(sq2.nodeCount).toEqual(3)
    expect(sq2.isEqualTo(sq1)).toEqual(true)
    expect(sq1.isEqualTo(sq2)).toEqual(true)
  })

  it('should not match two different trees', async function () {
    const sq1 = new SequoiaPath(TestDirD2)
    await expect(sq1.scan()).resolves.toEqual(true)
    expect(sq1.nodeCount).toEqual(3)
    const sq2 = new SequoiaPath(TestDirT2)
    await expect(sq2.scan()).resolves.toEqual(true)
    expect(sq2.nodeCount).toEqual(3)
    expect(sq2.isEqualTo(sq1)).toEqual(false)
    expect(sq1.isEqualTo(sq2)).toEqual(false)
  })

  it('should loop on a tree', async function () {
    const filesArray = []
    const directoriesArray = []
    sq.forEach({
      itemFn: ({ item }) => {
        if (item.isDirectory) directoriesArray.push(item)
        else if (item.isFile) filesArray.push(item)
      }
    })
    expect(directoriesArray.length).toEqual(sq.directoryCount)
    expect(filesArray.length).toEqual(sq.fileCount)
  })

  it('should walk in a tree', async function () {
    const filesArray = []
    const directoriesArray = []
    sq.walk({
      itemFn: ({ item /*, parent, isFirstChild, isLastChild */ }) => {
        if (item.isDirectory) directoriesArray.push(item)
        else if (item.isFile) filesArray.push(item)

        if (item.base === 'test_dir') expect(item.level).toEqual(1)
        else if (item.base === 'file33.txt') expect(item.level).toEqual(4)
        else if (item.base === 'directory6') expect(item.level).toEqual(2)
        else if (item.base === 'file18.wav') {
          expect(item.ext).toEqual('wav')
          expect(item.level).toEqual(3)
        }
      }
    })
    expect(directoriesArray.length).toEqual(sq.directoryCount)
    expect(filesArray.length).toEqual(sq.fileCount)
  })
})
