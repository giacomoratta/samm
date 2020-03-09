const { ConfigFile } = require('./configFile.class')
const log = require('../../core/logger').createLogger('config')

let ConfigInstance = null

const __init__ = (filePath) => {
  // ConfigInstance.addField({
  //   name: 'UserdataDirectory',
  //   schema: {
  //     type: 'relDirPath',
  //     basePath: basePath,
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'userdata',
  //   description: 'Directory for storing all the user data'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'SampleIndexFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'samples_index',
  //   description: 'Index generated after a full samples directory scan'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'ProjectHistoryFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'project_history',
  //   description: 'List of opened projects, current one, etc.'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'BookmarkFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'bookmarks',
  //   description: 'List of bookmarked samples'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'PathQueryFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'path_queries',
  //   description: 'File with queries for sample paths'
  // })
}

const ConfigCleanData = async () => {
  log.info('Cleaning data...')
  await ConfigInstance.clean()
}

const ConfigBoot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  ConfigInstance = new ConfigFile(filePath)
  try {
    await ConfigInstance.load()
    log.info('Loaded successfully')
    return true
  } catch (e) {
    log.error(e, 'Cannot load or save')
    return false
  }
}

module.exports = {
  Config: {
    field (name) { return ConfigInstance.field(name) },
    save () { return ConfigInstance.save() },
    getFieldsList () { return ConfigInstance.list({ writableOnly: true }) }
  },
  ConfigBoot,
  ConfigCleanData
}
