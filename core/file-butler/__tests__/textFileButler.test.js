const { TextFileButler } = require('../index')
const path = require('path')
const dirTestPath = path.join(__dirname, 'dir_test')

describe('FileButler basic operations', function () {
  it('should load no data because the file does not exist', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'no-file.null')
    })
    await fb.load()
    expect(fb.data).toEqual('')
    expect(fb.isEmpty).toEqual(true)
    await fb.delete()
  })

  it('should load content from empty file', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.empty.txt')
    })
    await fb.load()
    expect(fb.data).toEqual('')
    expect(fb.isEmpty).toEqual(true)
  })

  it('should load content from non-empty file', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.not.empty.txt')
    })
    await fb.load()
    expect(fb.data).toEqual('abc\n123\ndef\n')
    expect(fb.isEmpty).toEqual(false)
  })

  it('should load content from cloned file', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'no-file.null'),
      cloneFrom: path.join(dirTestPath, 'file.not.empty.txt')
    })
    await fb.load()
    expect(fb.data).toEqual('abc\n123\ndef\n')
    expect(fb.isEmpty).toEqual(false)
    await fb.delete()
  })

  it('should save and create the file because it does not exist', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'no-file.null')
    })
    await fb.load()
    fb.data = 'qwertyuiop'
    await fb.save()

    const fb2 = new TextFileButler({
      filePath: path.join(dirTestPath, 'no-file.null')
    })
    await fb2.load()
    expect(fb2.data).toEqual('qwertyuiop')
    await fb.delete()
  })

  it('should save and overwrite an existent file', function () {

  })

  it('should save and backup the current file', function () {

  })

  it('should not backup if the current file is empty', function () {
    // use internal flag - after loading has no data => flagEmptyFile=true
  })

  it('should manipulate data after loading with loadFn', function () {

  })

  it('should manipulate data before saving with saveFn', function () {

  })
})
