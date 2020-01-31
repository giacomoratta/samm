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
    expect(fb.data.replace(/[^a-z0-9]/gi, '')).toEqual('abc123def')
    expect(fb.isEmpty).toEqual(false)
  })

  it('should load content from cloned file', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'no-file.null'),
      cloneFrom: path.join(dirTestPath, 'file.not.empty.txt')
    })
    await fb.load()
    expect(fb.data.replace(/[^a-z0-9]/gi, '')).toEqual('abc123def')
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

  it('should save and backup the current file', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.not.empty.txt'),
      backupTo: path.join(dirTestPath, 'file.backup.txt')
    })
    await fb.load()
    await fb.save()

    const fb2 = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.backup.txt')
    })
    await fb2.load()
    expect(fb2.data).toEqual(fb.data)
    await fb2.delete()
  })

  it('should not backup if the current file is empty', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.empty.txt'),
      backupTo: path.join(dirTestPath, 'file.backup.txt')
    })
    await fb.load()
    await fb.save()

    const fb2 = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.backup.txt')
    })
    const loadResult = await fb2.load()
    expect(loadResult).toEqual(false)
    await fb2.delete()
  })

  it('should manipulate data after loading with loadFn', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.not.empty.txt'),
      loadFn: function (data) { return data + '11111' }
    })
    await fb.load()
    expect(fb.data.endsWith('11111')).toEqual(true)
  })

  it('should manipulate data before saving with saveFn', async function () {
    const fb = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.abc.txt'),
      saveFn: function (data) { return data + '11111' }
    })
    await fb.load()
    fb.data = 'abc'
    await fb.save()

    const fb2 = new TextFileButler({
      filePath: path.join(dirTestPath, 'file.abc.txt')
    })
    await fb2.load()
    expect(fb2.data).toEqual('abc11111')
    await fb2.delete()
  })
})
