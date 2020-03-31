const path = require('path')
const { PathQuery } = require('../../path-query')
const { SampleIndex } = require('../../../core/sequoia-path/sequoiaIndex.class.old')
const { SampleSet } = require('../sampleSet.class')
const { SampleInfo } = require('../sampleInfo.class')

let sIndex1
const SampleIndexFile = path.join(__dirname, 'test_dir', 'samples_index')
const SamplesDirectory = path.resolve(path.join(__dirname, '..', '..', '__tests__', 'test_dir'))

describe('SampleSet functions', function () {
  beforeAll(async () => {
    sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    await sIndex1.deleteFile()
    const result = await sIndex1.create()
    expect(result).toEqual(true)
    expect(sIndex1.size).toEqual(13)
  })

  afterAll(async () => {
    await sIndex1.deleteFile()
  })

  it('should create a sample set', async function () {
    /* Create criteria for validate function */
    const pathBQ1 = PathQuery.create('file2,4+directory')
    expect(pathBQ1).not.toEqual(null)

    /* Create a new SampleSet */
    const set1 = new SampleSet({
      validate: function (sample) {
        return sample.isFile === true && pathBQ1.check(sample.relPath)
      }
    })

    /* Fill sample set */
    await sIndex1.forEach(({ item }) => {
      set1.add(item)
    })

    /* Test sampleSet from here... */

    expect(set1.size).toEqual(5)

    set1.forEach((sampleInfoObj, index) => {
      expect(sampleInfoObj).toBeInstanceOf(SampleInfo)
      expect(sampleInfoObj.relRoot).toEqual(SamplesDirectory)
    })

    let randomArray1
    let testCounter1 = 20
    while (testCounter1 > 0) {
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
    const set2 = new SampleSet({
      validate: function (sample) {
        return sample.isFile === true && pathBQ2.check(sample.relPath)
      }
    })

    /* Fill sample set */
    await sIndex1.forEach(({ item }) => {
      set2.add(item)
    })

    /* Test sampleSet from here... */

    expect(set2.size).toEqual(13)

    let randomArray2
    let testCounter2 = 20
    while (testCounter2 > 0) {
      randomArray2 = (set2.random({
        max: 50,
        maxFromSameDirectory: 2
      }))
      expect(randomArray2.length).toEqual(10)
      testCounter2--
    }

    testCounter2 = 20
    while (testCounter2 > 0) {
      randomArray2 = (set2.random({
        max: 3,
        maxFromSameDirectory: 1
      }))
      expect(randomArray2.length).toEqual(3)
      testCounter2--
    }
  })
})
