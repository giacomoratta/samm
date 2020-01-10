const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { fileUtils } = require('../../../core/utils/file.utils')

const { Config } = require('../../config')
const { Sample } = require('../index')
const { PathQuery } = require('../../path-query')

let SamplesDirectory
let SampleIndexFile

describe('sample endpoints', function () {
  beforeEach(() => {
    SamplesDirectory = path.join(process.env.ABSOLUTE_APP_PATH, 'test_dir')
    SampleIndexFile = Config.get('SampleIndexFile')
    fileUtils.removeFileSync(SampleIndexFile)

    fileUtils.removeDirSync(path.join(process.env.ABSOLUTE_APP_PATH, 'userdata'))
    fileUtils.removeFileSync(path.join(process.env.ABSOLUTE_APP_PATH, 'config.json'))
  })

  it('should perform basic operations and lookups', async function () {

    expect(fileUtils.fileExistsSync(SampleIndexFile)).toEqual(false)
    Config.unset('SamplesDirectory')

    let result

    expect(Sample.hasIndex()).toEqual(false)
    expect(function () { Sample.indexSize() }).toThrow()

    result = await Sample.loadIndex()
    expect(result).toEqual(false)

    result = await Sample.createIndex()
    expect(result).toEqual(false)
    //return

    Config.set('SamplesDirectory', SamplesDirectory)
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
