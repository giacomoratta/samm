const path = require('path')
const testDirPath = path.join(__dirname, 'test_dir')
const { Project } = require('../project.class')

describe('Project class', function () {
  it('should create a new project', async function () {
    const testP = new Project()
    await expect(testP.set(path.join(testDirPath, 'projects', 'prj2'))).resolves.toEqual(true)
    expect(testP.isValid())
  })

  it('should throw because path does not exist', async function () {
    const testP = new Project()
    await expect(testP.set(path.join(testDirPath, 'projects', 'prj-abc'))).rejects.toThrow('Path does not exist')
    expect(testP.isValid())
  })

  it('should throw because path is not directory', async function () {
    const testP = new Project()
    await expect(testP.set(path.join(testDirPath, 'projects', 'my_project5'))).rejects.toThrow('Project is not a directory')
    expect(testP.isValid())
  })

  it('should return project siblings', async function () {
    const testP = new Project()
    await expect(testP.set(path.join(testDirPath, 'projects', 'prj2'))).resolves.toEqual(true)
    expect(testP.isValid())
    const sibData = await testP.getSiblings({ orderBy: 'modifiedAt' })
    expect(sibData.projects.length).toEqual(5)
    expect(sibData.failed.length).toEqual(2)
  })
})
