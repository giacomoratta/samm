const path = require('path')
const configDataLocation = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { fileUtils } = require('../../../core/utils/file.utils')

const { ConfigFile } = require('../configFile.class')

describe('configuration file class manager', function () {
  beforeEach(() => {
    fileUtils.removeFileSync(path.join(configDataLocation, 'config.json'))
  })

  it('should create and handle a config file', function () {
    let Config1

    // Config1 = new ConfigFile(ConfigFileWrongJson)
    // Config1.load()
  })
})
