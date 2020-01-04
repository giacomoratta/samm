const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const fileUtils = require('./../../../core/utils/file.utils')

const { Config } = require('../../config')
const { PathQuery } = require('../../path-query')

const { SamplesIndex } = require('../samplesIndex.class')
const { SamplesSet } = require('../samplesSet.class')

describe('SampleSet functions', function () {
  it('should create a sample set', async function () {

    let result
    const SampleIndexFile = path.join(__dirname,'fixed_samples_index')
    const SamplesDirectory = Config.get('SamplesDirectory')

    const sIndex1 = new SamplesIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    result = await sIndex1.load()
    expect(result).toEqual(true)
    expect(sIndex1.size).toEqual(13)

    /* Create criteria for validate function */
    const pathBQ1 = PathQuery.create('file2,4+directory')
    expect(pathBQ1).not.toEqual(null)

    /* Create a new SampleSet */
    const set1 = new SamplesSet({
      validate: function(sample) {
        return sample.isFile === true && pathBQ1.check(sample.relPath)
      }
    })

    /* Fill sample set */
    sIndex1.forEach(({item}) => {
      set1.add(item)
    })

    /* Test sampleSet from here... */

    expect(set1.size).toEqual(5)
    //expect(set1.).toEqual(5)

    const x1 = set1.toArray()
    x1.forEach((item) => {
      //console.log(`${item.name}\n${item.dir}\n`)
    })

    console.log('- - - - - - - - - -')

    const x2 = (set1.random({
      max:2,
      maxFromSameDirectory:1
    }))


    x2.forEach((item) => {
      console.log(`${item.name}\n${item.dir}\n`)
    })

    /*
     * create pathBasedQuery
     * new sampleSet
     *    set validateFn
     * sampleIndex
     *    foreach sampleSet.add ( validate... )
     */

  })
})
