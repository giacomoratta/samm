const path = require('path')
const { fileUtils } = require('../../../core/utils/file.utils')

const { Config, ConfigBoot, ConfigCleanData } = require('../../config')
const { Sample, SampleBoot, SampleCleanData } = require('../index')
const { PathQuery, PathQueryBoot, PathQueryCleanData } = require('../../path-query')

const ConfigFilePath = path.join(__dirname, 'test_dir', 'config.json')
const PathQueryFile = path.join(__dirname, 'test_dir', 'path_query')
const SampleIndexFile = path.join(__dirname, 'test_dir', 'samples_index')
const SamplesDirectory = path.resolve(path.join(__dirname, '..', '..', '__tests__', 'test_dir'))

describe('sample endpoints', function () {
  beforeAll(async () => {
    ConfigCleanData()
    PathQueryCleanData()
    SampleCleanData()
    expect(ConfigBoot(ConfigFilePath)).toEqual(true)
    expect(PathQueryBoot(PathQueryFile)).toEqual(true)
    Config.set('SamplesDirectory', SamplesDirectory)
    expect(await SampleBoot(SampleIndexFile)).toEqual(true)
  })

  afterAll(() => {
    ConfigCleanData()
    PathQueryCleanData()
    SampleCleanData()
  })

  it('should perform basic operations and lookups', async function () {
    let result

    expect(Sample.hasIndex()).toEqual(false)
    // expect(function () { Sample.indexSize() }).toThrow()

    result = await Sample.loadIndex()
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

    result = await Sample.sampleSetByPathQuery({ queryLabel: 'invalid-label' })
    expect(result).toEqual(undefined)

    result = await Sample.lookupByPathQuery({ queryLabel: 'invalid-label' })
    expect(result).toEqual(undefined)

    Config.set('RandomCount', 2)
    result = await Sample.lookupByPathQuery({ queryString: 'file2,file3' })
    expect(result.lookup.length).toEqual(2)

    result = await Sample.lookupByPathQuery({ queryString: 'invalid,query' })
    expect(result).toEqual(undefined)

    result = await Sample.sampleSetByPathQuery({ queryString: 'file2,file3' })
    expect(result.sampleSet.size).toEqual(5)

    result = await Sample.sampleSetByPathQuery({ queryString: 'invalid,query' })
    expect(result).toEqual(undefined)

    Config.set('RandomCount', 10)
    result = await Sample.lookupByPathQuery({ queryString: 'file2,file3' })
    expect(result.lookup.length).toEqual(5)

    PathQuery.add('my-new-label', 'file6,file3')
    result = await Sample.sampleSetByPathQuery({ queryLabel: 'my-new-label' })
    expect(result.sampleSet.size).toEqual(5)

    Config.set('RandomCount', 3)
    result = await Sample.lookupByPathQuery({ queryLabel: 'my-new-label' })
    expect(result.lookup.length).toEqual(3)
  })
})
