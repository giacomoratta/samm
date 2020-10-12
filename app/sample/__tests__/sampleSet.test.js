const path = require('path')
const { SampleSet } = require('../sampleSet.class')

const SamplesDirectory = path.join(path.resolve(path.join(__dirname, '..', '..', '__tests__')), 'test_dir')

describe('SampleSet class', function () {
  it('should create a basic sample set', async function () {
    const TestSampleSet = new SampleSet()

    const tmpSampleInfo1 = await SampleSet.create({ absolutePath: path.join(SamplesDirectory, 'directory1', 'file11.txt') })
    TestSampleSet.add(tmpSampleInfo1)

    const tmpSampleInfo2 = await SampleSet.create({ absolutePath: path.join(SamplesDirectory, 'directory1', 'file18.wav') })
    TestSampleSet.add(tmpSampleInfo2)

    const tmpSampleInfo3 = await SampleSet.create({ absolutePath: path.join(SamplesDirectory, 'directory6', 'file64.json') })
    TestSampleSet.add(tmpSampleInfo3)

    expect(TestSampleSet.size).toEqual(3)

    const testArray = []
    TestSampleSet.forEach((item) => {
      testArray.push(item)
    })
    expect(testArray.length).toEqual(3)
    expect(testArray[0].name).toEqual('file11')
    expect(testArray[1].name).toEqual('file18')
    expect(testArray[2].name).toEqual('file64')

    expect(TestSampleSet.remove(tmpSampleInfo2).name).toEqual('file18')
    expect(TestSampleSet.remove(tmpSampleInfo2)).toEqual(null)
    expect(TestSampleSet.size).toEqual(2)

    expect(TestSampleSet.remove(2)).toEqual(null)
    expect(TestSampleSet.remove(1).name).toEqual('file64')
    expect(TestSampleSet.remove(1)).toEqual(null)
    expect(TestSampleSet.size).toEqual(1)
  })

  it('should find samples', async function () {
    const TestSampleSet = new SampleSet()

    const tmpSampleInfo1 = await SampleSet.create({ absolutePath: path.join(SamplesDirectory, 'directory1', 'file11.txt') })
    TestSampleSet.add(tmpSampleInfo1)

    const tmpSampleInfo2 = await SampleSet.create({ absolutePath: path.join(SamplesDirectory, 'directory1', 'file18.wav') })
    TestSampleSet.add(tmpSampleInfo2)

    const tmpSampleInfo2Copy = await SampleSet.create({ absolutePath: path.join(SamplesDirectory, 'directory1', 'file18.wav') })
    // TestSampleSet.add(tmpSampleInfo1)

    expect(tmpSampleInfo2.isEqualTo(tmpSampleInfo2Copy)).toEqual(true)
    expect(TestSampleSet.find(tmpSampleInfo2)).toEqual(1)
    expect(TestSampleSet.find(tmpSampleInfo2Copy)).toEqual(1)
  })
})
