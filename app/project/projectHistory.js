const { Config } = require('../config')
const { ProjectHistoryJsonFile } = require('./projectHistoryJsonFile.class')

const ProjectHistoryFile = new ProjectHistoryJsonFile(Config.get('ProjectHistoryFile'))
ProjectHistoryFile.load()

const addToHistory = (projectPath) => {
  return ProjectHistoryFile.add(projectPath)
}

const latestFromHistory = () => {
  return ProjectHistoryFile.latest
}

const listHistory = () => {
  const array = []
  ProjectHistoryFile.forEach((project) => {
    array.push(project)
  })
  return array
}

const saveHistory = () => {
  return ProjectHistoryFile.save()
}

module.exports = {
  ProjectHistory: {
    add: addToHistory,
    latest: latestFromHistory,
    list: listHistory,
    save: saveHistory
  }
}
