const path = require('path')
// process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
// const { fileUtils } = require('../../../core/utils/file.utils')
const { Project } = require('../project.class')

describe('Project class', function () {
  // beforeAll(() => {
  //   fileUtils.removeDirSync(Config.get('UserdataDirectory'))
  //   Config.reset()
  // })
  //
  // afterAll(() => {
  //   fileUtils.removeDirSync(Config.get('UserdataDirectory'))
  // })

  it('Project basic methods', function () {
    let projectPath, projectObject

    expect(() => {
      projectObject = new Project({ projectPath: path.join(__dirname, 'test_dir', 'my_project_invalid') })
    }).toThrow()

    expect(() => {
      projectObject = new Project({ projectPath: 'invalid/path' })
    }).toThrow()

    projectPath = path.join(__dirname, 'test_dir', 'my_project1')
    projectObject = new Project({ projectPath })
    expect(projectObject.name).toEqual('my_project1')
    expect(projectObject.path).toEqual(projectPath)

    projectPath = path.join(__dirname, 'test_dir', 'my_project1.daw')
    projectObject = new Project({ projectPath })
    expect(projectObject.name).toEqual('my_project1.daw')
    expect(projectObject.path).toEqual(projectPath)

    const jsonObj = {
      name: 'my_project1.daw',
      path: projectPath
    }
    expect(projectObject.toJson()).toMatchObject(jsonObj)

    projectObject = new Project()
    projectObject.fromJson(jsonObj)
    expect(projectObject.name).toEqual('my_project1.daw')
    expect(projectObject.path).toEqual(projectPath)
  })
})
