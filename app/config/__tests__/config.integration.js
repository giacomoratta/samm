const path = require('path')
const configDataLocation = path.join(__dirname, 'config.json')
const { Config, ConfigBoot, ConfigCleanData } = require('../index')

describe('config endpoints', function () {
  beforeAll(() => {
    ConfigCleanData()
    expect(ConfigBoot(configDataLocation)).toEqual(true)
  })

  afterAll(() => {
    ConfigCleanData()
  })

  it('should create and handle the main app config file', function () {
    expect(Config.isUnset('SamplesDirectory')).toEqual(true)
  })
})
