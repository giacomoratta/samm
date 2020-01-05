const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const fileUtils = require('../../../core/utils/file.utils')

const { Config } = require('../../config')
const { Sample } = require('../index')
const { PathQuery } = require('../../path-query')

const SampleIndexFile = path.join(process.env.ABSOLUTE_APP_PATH, 'test_dir')

describe('sample endpoints', function () {
  it('should perform basic operations', async function () {
    fileUtils.removeFileSync(SampleIndexFile)
    let result

    expect(Sample.hasIndex()).toEqual(false)
    expect(Sample.indexSize()).toEqual(0)

    result = await Sample.loadIndex()
    expect(result).toEqual(false)

    result = await Sample.createIndex()
    expect(result).toEqual(false)

    Config.set('SamplesDirectory', SampleIndexFile)
    result = await Sample.createIndex()
    expect(result).toEqual(true)
    expect(Sample.hasIndex()).toEqual(true)
    expect(Sample.indexSize()).toEqual(13)

    result = await Sample.loadIndex()
    expect(result).toEqual(true)
    expect(Sample.hasIndex()).toEqual(true)
    expect(Sample.indexSize()).toEqual(13)
  })

  it('should perform some lookups', async function () {
    Config.set('SamplesDirectory', SampleIndexFile)
    let result

    result = await Sample.loadIndex()
    expect(result).toEqual(true)
    expect(Sample.hasIndex()).toEqual(true)
    expect(Sample.indexSize()).toEqual(13)

    result = Sample.sampleSetByPathQuery({ queryLabel: 'invalid-label' })
    expect(result).toEqual(undefined)

    result = Sample.lookupByPathQuery({ queryLabel: 'invalid-label' })
    expect(result.length).toEqual(0)

    Config.set('RandomCount', 2)
    result = Sample.lookupByPathQuery({ queryString: 'file2,file3' })
    expect(result.length).toEqual(2)

    result = Sample.lookupByPathQuery({ queryString: 'invalid,query' })
    expect(result.length).toEqual(0)

    result = Sample.sampleSetByPathQuery({ queryString: 'file2,file3' })
    expect(result.size).toEqual(5)

    result = Sample.sampleSetByPathQuery({ queryString: 'invalid,query' })
    expect(result).toEqual(undefined)

    Config.set('RandomCount', 10)
    result = Sample.lookupByPathQuery({ queryString: 'file2,file3' })
    expect(result.length).toEqual(5)

    PathQuery.add('my-new-label', 'file6,file3')
    result = Sample.sampleSetByPathQuery({ queryLabel: 'my-new-label' })
    expect(result.size).toEqual(5)

    Config.set('RandomCount', 3)
    result = Sample.lookupByPathQuery({ queryLabel: 'my-new-label' })
    expect(result.length).toEqual(3)
  })
})
