const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { fileUtils } = require('../../../core/utils/file.utils')


const { ConfigFile } = require('../configFile.class')

describe('configuration file class manager', function () {
  beforeEach(() => {
    fileUtils.removeDirSync(path.join(process.env.ABSOLUTE_APP_PATH, 'userdata'))
    fileUtils.removeFileSync(path.join(process.env.ABSOLUTE_APP_PATH, 'config.json'))
  })

  it('should create and handle a config file', function () {
    let Config1
    const ConfigFileWrongJson = path.join(__dirname, 'config_file_wrong_json')
    const ConfigFileEmpty = path.join(__dirname, 'config_file_empty')
    const ConfigFileNotExists = path.join(__dirname, 'config_file_not_exists')

    Config1 = new ConfigFile(ConfigFileWrongJson)
    Config1.load()
    expect(Config1.fileHolder.data).toEqual(null)

    Config1 = new ConfigFile(ConfigFileEmpty)
    Config1.load()
    expect(Config1.fileHolder.data).toEqual(null)

    Config1 = new ConfigFile(ConfigFileNotExists)
    Config1.load()
    expect(Config1.fileHolder.data).toEqual(null)
  })
})
