const path = require('path')
const configDataLocation = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { Config, ConfigBoot, ConfigCleanData } = require('../index')

describe('config endpoints', function () {
  beforeAll(() => {
    ConfigCleanData()
    expect(ConfigBoot(path.join(configDataLocation, 'config.json'))).toEqual(true)
  })

  afterAll(() => {
    ConfigCleanData()
  })

  it('should create and handle the main app config file', function () {
    expect(Config.isUnset('SamplesDirectory')).toEqual(true)
  })
})
