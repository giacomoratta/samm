const config = require('../config').API.config
const { Project } = require('./project.class')
const { ProjectHistoryFile } = require('./projectHistoryFile.class')
const log = require('../../core/logger').createLogger('project')

let ProjectHistoryFileInstance = null

const boot = async (filePath) => {
  log.info('Booting...')
  try {
    ProjectHistoryFileInstance = new ProjectHistoryFile(filePath)
    const dataPresence = await ProjectHistoryFileInstance.fileHolder.load()
    log.info({ dataPresence }, 'History loaded successfully')
    // todo: remove all invalid projects (not exists)
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
      /* ! Do not allow to delete directories ! */

      create: ({ projectPath }) => {
        // create a new project directory if not exists
        // todo: projectObj can be template
      },

      copy: ({ projectPath, projectSourcePath }) => {
        // create a new project directory if not exists
        // check source exists
        // copy source to projectPath
        // todo: projectObj can be template
      },

      getCurrentProject: () => {
        return ProjectHistoryFileInstance.collection.latest
      },

      setCurrentProject: async ({ projectObj, projectPath }) => {
        // string or Project
        // check project exists
        return ProjectHistoryFileInstance.collection.add(projectObj)
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
