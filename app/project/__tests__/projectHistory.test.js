const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { fileUtils } = require('../../../core/utils/file.utils')

const { Config } = require('../../config')
const { ProjectHistory } = require('../projectHistory')

describe('ProjectHistory endpoints', function () {
  it('ProjectHistory basic functions', function () {
    let projectPath, projectObject, jsonObj, fileContent, phArray

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

    fileContent = fileUtils.readJsonFileSync(Config.get('ProjectHistoryFile'))
    expect(fileContent.ProjectHistory.length).toEqual(15)
    expect(fileContent.ProjectHistory[0].path).toEqual(path.join(__dirname, 'test_dir', 'my_project17'))
    expect(fileContent.ProjectHistory[fileContent.ProjectHistory.length - 1].path).toEqual(path.join(__dirname, 'test_dir', 'my_project3'))

    phArray = ProjectHistory.list()
    expect(phArray.length).toEqual(15)
    expect(phArray[0].path).toEqual(path.join(__dirname, 'test_dir', 'my_project17'))
    expect(phArray[phArray.length - 1].path).toEqual(path.join(__dirname, 'test_dir', 'my_project3'))

    fileUtils.writeTextFileSync(Config.get('ProjectHistoryFile'), '')
  })
})
