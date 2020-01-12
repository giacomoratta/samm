const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { Config, ConfigBoot, ConfigCleanData } = require('../index')
const { fileUtils } = require('../../../core/utils/file.utils')

describe('config endpoints', function () {
  beforeAll(() => {
    ConfigCleanData()
    expect(ConfigBoot()).toEqual(true)
  })

  afterAll(() => {
    ConfigCleanData()
  })

  it('should create and handle the main app config file', function () {
    expect(Config.isUnset('SamplesDirectory')).toEqual(true)
  })
})
