const path = require('path')
const { fileUtils } = require('../../../core/utils/file.utils')

const { Config, ConfigBoot, ConfigCleanData } = require('../../config')
const { Sample, SampleBoot, SampleCleanData } = require('../index')
const { PathQuery } = require('../../path-query')

const ConfigFilePath = path.join(__dirname, 'test_dir', 'config.json')
const SampleIndexFile = path.join(__dirname, 'test_dir', 'samples_index')
const SamplesDirectory = path.resolve(path.join(__dirname, '..', '..', '__tests__', 'test_dir'))

describe('sample endpoints', function () {
  beforeAll(async () => {
    ConfigCleanData()
    SampleCleanData()
    expect(ConfigBoot(ConfigFilePath)).toEqual(true)
    Config.set('SamplesDirectory', SamplesDirectory)
    expect(await SampleBoot(SampleIndexFile)).toEqual(true)
  })

  afterAll(() => {
    ConfigCleanData()
    SampleCleanData()
  })

  it('should perform basic operations and lookups', async function () {
    let result

    expect(Sample.hasIndex()).toEqual(false)
    // expect(function () { Sample.indexSize() }).toThrow()

    result = await Sample.loadIndex()
    expect(result).toEqual(false)

    result = await Sample.createIndex()
    expect(result).toEqual(false)

    result = await Sample.createIndex()
    expect(result).toEqual(true)
    expect(Sample.hasIndex()).toEqual(true)
    expect(Sample.indexSize()).toEqual(13)

    expect(fileUtils.fileExistsSync(SampleIndexFile)).toEqual(true)
    result = await Sample.loadIndex()
    expect(result).toEqual(true)
    expect(Sample.hasIndex()).toEqual(true)
    expect(Sample.indexSize()).toEqual(13)

    // lookups

    result = await Sample.loadIndex()
    expect(result).toEqual(true)
    expect(Sample.hasIndex()).toEqual(true)
    expect(Sample.indexSize()).toEqual(13)

    result = Sample.sampleSetByPathQuery({ queryLabel: 'invalid-label' })
    expect(result).toEqual(undefined)

    result = Sample.lookupByPathQuery({ queryLabel: 'invalid-label' })
    expect(result).toEqual(undefined)

    Config.set('RandomCount', 2)
    result = Sample.lookupByPathQuery({ queryString: 'file2,file3' })
    expect(result.lookup.length).toEqual(2)

    result = Sample.lookupByPathQuery({ queryString: 'invalid,query' })
    expect(result).toEqual(undefined)

    result = Sample.sampleSetByPathQuery({ queryString: 'file2,file3' })
    expect(result.sampleSet.size).toEqual(5)

    result = Sample.sampleSetByPathQuery({ queryString: 'invalid,query' })
    expect(result).toEqual(undefined)

    Config.set('RandomCount', 10)
    result = Sample.lookupByPathQuery({ queryString: 'file2,file3' })
    expect(result.lookup.length).toEqual(5)

    PathQuery.add('my-new-label', 'file6,file3')
    result = Sample.sampleSetByPathQuery({ queryLabel: 'my-new-label' })
    expect(result.sampleSet.size).toEqual(5)

    Config.set('RandomCount', 3)
    result = Sample.lookupByPathQuery({ queryLabel: 'my-new-label' })
    expect(result.lookup.length).toEqual(3)
  })
})
