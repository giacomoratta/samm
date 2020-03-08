const path = require('path')
// const configDataLocation = path.resolve(path.join(__dirname, '..', '..', '__tests__'))

const { ConfigFile } = require('../configFile.class')
let ConfigInstance = null

describe('configuration file class manager', function () {
  beforeEach(async () => {
    ConfigInstance = new ConfigFile(path.join(__dirname, 'config.json'))
    await ConfigInstance.clean()
  })

  it('should create and handle a config file', function () {
    // let Config1

    // Config1 = new ConfigFile(ConfigFileWrongJson)
    // Config1.load()
  })
})
