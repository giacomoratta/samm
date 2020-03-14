const { ProjectHistoryJsonFile } = require('./projectHistoryJsonFile.class.old')
const log = require('../../core/logger').createLogger('project-history')

let ProjectHistoryFile

const addToHistory = (projectPath) => {
  log.info(`Adding to history ${projectPath}...`)
  return ProjectHistoryFile.add(projectPath)
}

const latestFromHistory = () => {
  return ProjectHistoryFile.latest
}

const listHistory = () => {
  const list = []
  ProjectHistoryFile.forEach((project) => {
    list.push(project)
  })
  return list
}

const loadHistory = () => {
  log.info('Loading history...')
  return ProjectHistoryFile.load()
}

const saveHistory = () => {
  log.info('Saving history...')
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
    load: loadHistory,
    save: saveHistory
  },
  ProjectHistoryBoot,
  ProjectHistoryCleanData
}
