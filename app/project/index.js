const configModule = require('../config')
const { ProjectHistoryFile } = require('./projectHistoryFile.class')
const log = require('../../core/logger').createLogger('project')

const config = configModule.API.config

let ProjectHistoryFileInstance = null

const boot = async (filePath) => {
  log.info('Booting...')
  try {
    ProjectHistoryFileInstance = new ProjectHistoryFile(filePath)
    const dataPresence = await ProjectHistoryFileInstance.fileHolder.load()
    log.info({ dataPresence }, 'History loaded successfully')
    return true
  } catch (e) {
    log.error(e, 'Cannot load history')
    return false
  }
}

const clean = async () => {
  log.info('Cleaning data...')
  if (!ProjectHistoryFileInstance) return
  try {
    ProjectHistoryFileInstance.collection.clean()
    return await ProjectHistoryFileInstance.fileHolder.delete()
  } catch (e) {
    log.error(e, 'Error while cleaning history')
    return false
  }
}

module.exports = {
  boot,
  clean,

  API: {
    projectManager: {
      create: ({ templateObj, projectPath }) => {},

      current: () => {
        return ProjectHistoryFileInstance.collection.latest
      },

      listSiblings: () => {
        // todo
        // return array of Project object
      }
    },

    projectHistory: {
      get: (index) => {
        return ProjectHistoryFileInstance.collection.get(index)
      },

      latest: () => {
        return ProjectHistoryFileInstance.collection.latest
      },

      list: () => {
        const array = []
        ProjectHistoryFileInstance.collection.forEach((index, projectObj) => {
          array.push(projectObj.path)
        })
        return array
      }
    },

    projectTemplate: {
      list: () => {
        if (config.field('TemplatesDirectory').unset !== false || config.field('TemplatesDirectory').fn.exists() !== true) {
          return
        }
        const array = []
        // todo
        return array
      }
    }
  }
}
