const { ProjectHistoryJsonFile } = require('./projectHistoryJsonFile.class')
const log = require('../../core/logger').createLogger('project-history')

let ProjectHistoryFile

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

const ProjectHistoryBoot = (filePath) => {
  log.info(`Booting from ${filePath}...`)
  ProjectHistoryFile = new ProjectHistoryJsonFile(filePath)
  return ProjectHistoryFile.load()
}

const ProjectHistoryCleanData = () => {
  log.info('Cleaning data...')
  if (!ProjectHistoryFile) return
  return ProjectHistoryFile.deleteFile()
}

module.exports = {
  ProjectHistory: {
    add: addToHistory,
    latest: latestFromHistory,
    list: listHistory,
    save: saveHistory
  },
  ProjectHistoryBoot,
  ProjectHistoryCleanData
}
