const { ConfigFile } = require('./configFile.class')
const log = require('../../core/logger').createLogger('config')

let ConfigInstance = null
const configFilePath = process.cwd()

// const __init__ = (filePath) => {
//   ConfigInstance.addField({
//     name: 'UserdataDirectory',
//     schema: {
//       type: 'relDirPath',
//       basePath: basePath,
//       createIfNotExists: true,
//       readOnly: true
//     },
//     value: 'userdata',
//     description: 'Directory for storing all the user data'
//   })
//
//   ConfigInstance.addField({
//     name: 'SampleIndexFile',
//     schema: {
//       type: 'relFilePath',
//       basePath: ConfigInstance.getField('UserdataDirectory').get(),
//       createIfNotExists: true,
//       readOnly: true
//     },
//     value: 'samples_index',
//     description: 'Index generated after a full samples directory scan'
//   })
//
//   ConfigInstance.addField({
//     name: 'ProjectHistoryFile',
//     schema: {
//       type: 'relFilePath',
//       basePath: ConfigInstance.getField('UserdataDirectory').get(),
//       createIfNotExists: true,
//       readOnly: true
//     },
//     value: 'project_history',
//     description: 'List of opened projects, current one, etc.'
//   })
//
//   ConfigInstance.addField({
//     name: 'BookmarkFile',
//     schema: {
//       type: 'relFilePath',
//       basePath: ConfigInstance.getField('UserdataDirectory').get(),
//       createIfNotExists: true,
//       readOnly: true
//     },
//     value: 'bookmarks',
//     description: 'List of bookmarked samples'
//   })
//
//   ConfigInstance.addField({
//     name: 'PathQueryFile',
//     schema: {
//       type: 'relFilePath',
//       basePath: ConfigInstance.getField('UserdataDirectory').get(),
//       createIfNotExists: true,
//       readOnly: true
//     },
//     value: 'path_queries',
//     description: 'File with queries for sample paths'
//   })
// }

const clean = async () => {
  log.info('Cleaning data...')
  await ConfigInstance.clean()
}

const boot = async () => {
  log.info(`Booting from ${configFilePath}...`)
  ConfigInstance = new ConfigFile(configFilePath)
  try {
    await ConfigInstance.load()
    log.info('Loaded successfully')
    return true
  } catch (e) {
    log.error(e, 'Cannot load or save')
    return false
  }
}

const apiConfig = {
  field (name) {
    return ConfigInstance.field(name)
  },

  getFieldsList () {
    return ConfigInstance.list({ writableOnly: true })
  },

  async save () {
    try {
      const saveResult = ConfigInstance.save()
      saveResult === true && log.info('Configuration saved succesfully.')
      saveResult !== true && log.info('Configuration not saved.')
    } catch (e) {
      log.error(e, 'Error while saving the configuration.')
    }
  }
}

module.exports = { apiConfig, moduleConfig: { boot, clean } }
