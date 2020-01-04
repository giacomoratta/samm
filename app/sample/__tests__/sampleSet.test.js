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
    const SampleIndexFile = path.join(__dirname, 'fixed_samples_index')
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
      validate: function (sample) {
        return sample.isFile === true && pathBQ1.check(sample.relPath)
      }
    })

    /* Fill sample set */
    sIndex1.forEach(({ item }) => {
      set1.add(item)
    })

    /* Test sampleSet from here... */

    expect(set1.size).toEqual(5)

    let randomArray1
    let testCounter1 = 20
    while(testCounter1 > 0) {
      randomArray1 = (set1.random({
        max: 2,
        maxFromSameDirectory: 1
      }))
      expect(randomArray1.length).toEqual(2)
      expect(randomArray1[0].dir).not.toEqual(randomArray1[1].dir)
      testCounter1--
    }

    /* Create criteria for validate function (2) */
    const pathBQ2 = PathQuery.create('fil')
    expect(pathBQ2).not.toEqual(null)

    /* Create a new SampleSet */
    const set2 = new SamplesSet({
      validate: function (sample) {
        return sample.isFile === true && pathBQ2.check(sample.relPath)
      }
    })

    /* Fill sample set */
    sIndex1.forEach(({ item }) => {
      set2.add(item)
    })

    /* Test sampleSet from here... */

    expect(set2.size).toEqual(13)
    set2.toArray()

    let randomArray2
    let testCounter2 = 20
    while(testCounter2 > 0) {
      randomArray2 = (set2.random({
        max: 50,
        maxFromSameDirectory: 2
      }))
      expect(randomArray2.length).toEqual(10)
      testCounter2--
    }

    testCounter2 = 20
    while(testCounter2 > 0) {
      randomArray2 = (set2.random({
        max: 3,
        maxFromSameDirectory: 1
      }))
      expect(randomArray2.length).toEqual(3)
      testCounter2--
    }

  })
})
