const path = require('path')
const os = require('os')
const { ConfigFile } = require('./configFile.class')
const log = require('../../core/logger').createLogger('config')

let ConfigInstance = null
let ConfigCleanDataPostponed = false
const PlatformSignature = `${os.platform()}-${os.release()}`

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

const ConfigCleanData = () => {
  if (ConfigInstance === null) {
    log.info('Clean data postponed')
    ConfigCleanDataPostponed = true
    return
  }
  log.info('Cleaning data...')
  ConfigInstance.deleteFile()
}

const ConfigBoot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  ConfigInstance = new ConfigFile(filePath)
  if (ConfigCleanDataPostponed === true) {
    ConfigCleanData()
    ConfigCleanDataPostponed = false
  }
  if (await ConfigInstance.load() === true) {
    await ConfigInstance.save()
    log.info('Loaded successfully')
    if (ConfigInstance.get('Platform') !== PlatformSignature) {
      log.info(`Different platform signature (current: ${PlatformSignature}). Resetting...`)
      return ConfigInstance.reset()
    }
    return true
  }
  log.info('Cannot load or save')
  return false
}

module.exports = {
  Config: {
    get (name) { return ConfigInstance.get(name) },
    set (name, value) { return ConfigInstance.set(name, value) },
    unset (name) { return ConfigInstance.unset(name) },
    isUnset (name) { return ConfigInstance.isUnset(name) },
    save () { return ConfigInstance.save() },
    getField (name) { return ConfigInstance.getField(name) },
    getFieldsList () { return ConfigInstance.getFieldsList({ writableOnly: true }) }
  },
  ConfigBoot,
  ConfigCleanData
}

module.exports = ({ reboot = false, clean = false }) => {
  if (reboot === false || !ConfigInstance) {
    return {}
  }
  return {}
}
