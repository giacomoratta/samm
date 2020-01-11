const path = require('path')
const { fileUtils } = require('../../../core/utils/file.utils')
const { SampleIndex } = require('../../sample/sampleIndex.class')
const { BookmarksJsonFile } = require('../bookmarksJsonFile.class')

const SamplesDirectory = path.join(path.resolve(path.join(__dirname, '..', '..', '__tests__')), 'test_dir')

const SampleIndexFile = path.join(__dirname, 'samples_index')
const BookmarkFile1 = path.join(__dirname, 'bookmarks1.json')

describe('CliInput class and object', function () {
  beforeAll(function () {
    fileUtils.removeFileSync(SampleIndexFile)
    fileUtils.removeFileSync(BookmarkFile1)
  })

  afterAll(function () {
    fileUtils.removeFileSync(SampleIndexFile)
    fileUtils.removeFileSync(BookmarkFile1)
  })

  it('test', async function () {
    expect(fileUtils.fileExistsSync(SampleIndexFile)).toEqual(false)
    expect(fileUtils.fileExistsSync(BookmarkFile1)).toEqual(false)

    const smpIndex = new SampleIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    await smpIndex.create()
    expect(fileUtils.fileExistsSync(SampleIndexFile)).toEqual(true)

    const bkFile = new BookmarksJsonFile(BookmarkFile1)
    bkFile.load()
    bkFile.save()
    expect(fileUtils.fileExistsSync(BookmarkFile1)).toEqual(true)

    expect(smpIndex.size).toEqual(13)

    const samplesArray = []
    smpIndex.forEach(({ item }) => { if (item.isFile) samplesArray.push(item) })

    bkFile.addBookmark('tag1', samplesArray[0])
    bkFile.addBookmark('tag2', samplesArray[1])
    bkFile.addBookmark('tag3', samplesArray[3])
    bkFile.addBookmark('tag1', samplesArray[4])
    bkFile.addBookmark('tag3', samplesArray[5])
    bkFile.addBookmark('tag3', samplesArray[6])

    expect(bkFile.getTagCollection('tag1').length).toEqual(2)
    expect(bkFile.getTagCollection('tag2').length).toEqual(1)
    expect(bkFile.getTagCollection('tag3').length).toEqual(3)

    bkFile.addBookmark('A_tag1', samplesArray[0])
    bkFile.addBookmark('Z_tag1', samplesArray[1])
    bkFile.addBookmark('B_tag1', samplesArray[1])

    bkFile.removeBookmark('tag1', samplesArray[4])
    expect(bkFile.getTagCollection('tag1').length).toEqual(1)

    expect(bkFile.hasTagCollection('tag1')).toEqual(true)
    bkFile.removeBookmark('tag1', samplesArray[0])
    expect(bkFile.getTagCollection('tag1')).toEqual(null)
    expect(bkFile.hasTagCollection('tag1')).toEqual(false)
    expect(bkFile.removeBookmarkByIndex('tag1', 3)).toEqual(false)

    expect(bkFile.hasTagCollection('tag3')).toEqual(true)
    expect(bkFile.removeBookmarkByIndex('tag3', 3)).toEqual(false)
    expect(bkFile.hasBookmark('tag3', samplesArray[5])).toEqual(true)
    expect(bkFile.hasBookmark('tag3', samplesArray[6])).toEqual(true)
    expect(bkFile.hasBookmark('tag3', samplesArray[3])).toEqual(true)
    expect(bkFile.hasBookmark('tag3', samplesArray[2])).toEqual(false)
    expect(bkFile.hasBookmark('tag3', samplesArray[7])).toEqual(false)
    expect(bkFile.removeBookmarkByIndex('tag3', 1)).toEqual(true)
    expect(bkFile.hasBookmark('tag3', samplesArray[5])).toEqual(false)
    // expect(bkFile.hasTagCollection('tag1')).toEqual(false)

    // todo add/remove from array -> manage indexes!

    // bkFile.save()
  })
})
