const path = require('path')
const projectHistoryFilePath = path.join(__dirname, 'userdata', 'project_history')
const { fileUtils } = require('../../../core/utils/file.utils')

const { ProjectHistory, ProjectHistoryBoot, ProjectHistoryCleanData } = require('./projectHistory.old')

describe('ProjectHistory endpoints', function () {
  beforeAll(() => {
    ProjectHistoryCleanData()
    fileUtils.removeDirSync(path.join(__dirname, 'userdata'))
    expect(ProjectHistoryBoot(projectHistoryFilePath)).toEqual(true)
  })

  afterAll(() => {
    ProjectHistoryCleanData()
    fileUtils.removeDirSync(path.join(__dirname, 'userdata'))
  })

  it('ProjectHistory basic functions', function () {
    let projectPath

    projectPath = path.join(__dirname, 'test_dir', 'my_project1')
    expect(ProjectHistory.add(projectPath)).toEqual(true)
    expect(ProjectHistory.add()).toEqual(false)
    expect(function () {
      ProjectHistory.add('invalid/path')
    }).toThrow()

    expect(ProjectHistory.latest().name).toEqual('my_project1')
    expect(ProjectHistory.latest().path).toEqual(projectPath)

    expect(ProjectHistory.save()).toEqual(true)

    for (let i = 2; i < 18; i++) {
      projectPath = path.join(__dirname, 'test_dir', 'my_project' + i)
      expect(ProjectHistory.add(projectPath)).toEqual(true)
      expect(ProjectHistory.latest().name).toEqual('my_project' + i)
      expect(ProjectHistory.latest().path).toEqual(projectPath)
    }

    expect(ProjectHistory.save()).toEqual(true)

    const fileContent = fileUtils.readJsonFileSync(projectHistoryFilePath)
    expect(fileContent.length).toEqual(15)
    expect(fileContent[0].path).toEqual(path.join(__dirname, 'test_dir', 'my_project17'))
    expect(fileContent[fileContent.length - 1].path).toEqual(path.join(__dirname, 'test_dir', 'my_project3'))

    const phArray = ProjectHistory.list()
    expect(phArray.length).toEqual(15)
    expect(phArray[0].path).toEqual(path.join(__dirname, 'test_dir', 'my_project17'))
    expect(phArray[phArray.length - 1].path).toEqual(path.join(__dirname, 'test_dir', 'my_project3'))
  })
})
