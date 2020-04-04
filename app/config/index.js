const { ConfigFile } = require('./configFile.class')
const log = require('../logger').createLogger('config')

let ConfigInstance = null

const clean = async () => {
  log.info('Cleaning data...')
  await ConfigInstance.clean()
}

const boot = async (configFilePath) => {
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

module.exports = {
  boot,
  clean,

  API: {
    config: {

      field (name) {
        return ConfigInstance.field(name)
      },

      has (name) {
        return ConfigInstance.has(name)
      },

      getFieldsList () {
        return ConfigInstance.list({ writableOnly: true })
      },

      async save () {
        try {
          const saveResult = await ConfigInstance.save()
          saveResult === true && log.info('Configuration saved successfully.')
          saveResult !== true && log.info('Configuration not saved.')
        } catch (e) {
          log.error(e, 'Error while saving the configuration.')
        }
      }
    }
  }
}
