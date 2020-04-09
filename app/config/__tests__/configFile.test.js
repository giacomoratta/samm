const path = require('path')
const { ConfigFile } = require('../configFile.class')
let ConfigInstance = null

describe('App-specific ConfigFile', function () {
  beforeAll(async function () {
    ConfigInstance = new ConfigFile(path.join(__dirname, 'config_test1.json'), path.join(__dirname, 'config_test_base1.json'))
    await ConfigInstance.clean()
  })

  afterAll(async function () {
    await ConfigInstance.clean()
  })

  it('should load and create a config file with default values', async function () {
    await expect(ConfigInstance.load()).resolves.toEqual(true)
    expect(ConfigInstance.field('SamplesDirectoryExclusions').valueRef).toMatchObject([
      'samplePack1',
      'samplePack2'
    ])
    expect(ConfigInstance.field('LookRandomCount').valueRef).toEqual(15)
    expect(ConfigInstance.field('LookRandomSameDirectory').valueRef).toEqual(2)
    expect(ConfigInstance.field('ExtensionsPolicyForSamples').valueRef).toEqual('X')

    expect(ConfigInstance.field('ExcludedExtensionsForSamples').valueRef).toMatchObject(['exe', 'DS_Store', 'info'])
    expect(ConfigInstance.field('IncludedExtensionsForSamples').valueRef).toMatchObject(['wav', 'mp3'])
    expect(ConfigInstance.field('Status').valueRef).toMatchObject({
      'first-scan-needed': false,
      'new-scan-needed': false
    })
  })

  it('should change some fields, save and reload', async function () {
    ConfigInstance.field('LookRandomCount').value = 21
    ConfigInstance.field('LookRandomSameDirectory').value = 3
    ConfigInstance.field('ExtensionsPolicyForSamples').value = 'E'

    expect(ConfigInstance.field('LookRandomCount').valueRef).toEqual(21)
    expect(ConfigInstance.field('LookRandomSameDirectory').valueRef).toEqual(3)
    expect(ConfigInstance.field('ExtensionsPolicyForSamples').valueRef).toEqual('E')

    await ConfigInstance.save()
    await expect(ConfigInstance.load()).resolves.toEqual(true)

    expect(ConfigInstance.field('LookRandomCount').valueRef).toEqual(15)
    expect(ConfigInstance.field('LookRandomSameDirectory').valueRef).toEqual(2)
    expect(ConfigInstance.field('ExtensionsPolicyForSamples').valueRef).toEqual('X')
  })
})
