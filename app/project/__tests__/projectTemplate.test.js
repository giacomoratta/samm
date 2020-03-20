const path = require('path')
const { ProjectTemplates } = require('../projectTemplate.class')

describe('ProjectTemplate class', function () {
  it('should throw some errors', async function () {
    expect(function () {
      return new ProjectTemplates('not-valid-abs-path')
    }).toThrow('is not an absolute path')

    await expect((() => {
      const ptRepo = new ProjectTemplates(path.join(__dirname, 'test_dir', 'templates-not'))
      return ptRepo.scan()
    })()).rejects.toThrow('path does not exist')
  })

  it('should scan a template directory and get a sorted list', async function () {
    const ptRepo = new ProjectTemplates(path.join(__dirname, 'test_dir', 'templates'))

    await ptRepo.scan()
    expect(ptRepo.empty).toEqual(false)
    expect(ptRepo.list.length).toEqual(3)

    expect(ptRepo.list[0].name).toEqual('tpl1')
    expect(ptRepo.list[1].name).toEqual('tpl2')
    expect(ptRepo.list[2].name).toEqual('tpl3')
  })
})
