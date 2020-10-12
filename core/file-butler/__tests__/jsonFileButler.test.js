const { JsonFileButler } = require('../index')
const path = require('path')
const dirTestPath = path.join(__dirname, 'dir_test')

describe('JsonFileButler custom operations', function () {
  it('should load json correctly', async function () {
    const fb = new JsonFileButler({
      filePath: path.join(dirTestPath, 'file33.json')
    })
    await fb.load()
    expect(fb.data).toMatchObject({
      aaaaa: 432432
    })
    expect(fb.empty).toEqual(false)
  })

  it('should load even if json is wrong', async function () {
    const fb = new JsonFileButler({
      filePath: path.join(dirTestPath, 'file33.wrong.json')
    })
    await expect(fb.load()).resolves.toEqual(false)
    expect(fb.data).toEqual(null)

    expect(function () { fb.data = 123 }).toThrow('This data is not valid as json')
  })

  it('should save json correctly', async function () {
    const fb = new JsonFileButler({
      filePath: path.join(dirTestPath, 'file44.json')
    })
    await fb.load()
    expect(fb.empty).toEqual(true)
    fb.data = {
      bbbbb: 654533
    }
    await fb.save()

    const fb2 = new JsonFileButler({
      filePath: path.join(dirTestPath, 'file44.json')
    })
    await fb2.load()
    expect(fb2.data).toEqual(fb.data)
    await fb.delete()
  })

  it('should change json after loading', async function () {
    const fb = new JsonFileButler({
      filePath: path.join(dirTestPath, 'file33.json'),
      loadFn: function (data) {
        if (data.aaaaa === 432432) {
          data.aaaaa = 123123
        }
        data.bbbbb = 987987
        return data
      }
    })
    await fb.load()
    expect(fb.data).toMatchObject({
      aaaaa: 123123,
      bbbbb: 987987
    })
  })

  it('should change json before saving', async function () {
    const fb = new JsonFileButler({
      filePath: path.join(dirTestPath, 'file44.json'),
      saveFn: function (data) {
        if (!data) data = {}
        data.aaaaa = 123123
        data.bbbbb = 987987
        return data
      }
    })
    await fb.load()
    expect(fb.empty).toEqual(true)
    await fb.save()

    const fb2 = new JsonFileButler({
      filePath: path.join(dirTestPath, 'file44.json')
    })
    await fb2.load()
    expect(fb2.data).toMatchObject({
      aaaaa: 123123,
      bbbbb: 987987
    })
    await fb2.delete()
  })
})
