const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const fileUtils = require('./../../../core/utils/file.utils')

const { Config } = require('../../config')
const { SampleIndex } = require('../sampleIndex.class')

Config.set('SamplesDirectory', path.join(process.env.ABSOLUTE_APP_PATH, 'test_dir'))

describe('SampleIndex functions', function () {
  it('should create a sample index', async function () {
    let result
    const SampleIndexFile = Config.get('SampleIndexFile')
    const SamplesDirectory = Config.get('SamplesDirectory')
    fileUtils.removeFileSync(SampleIndexFile)

    expect(function () {
      const sIndex1 = new SampleIndex({
        indexFilePath: SampleIndexFile,
        samplesPath: SamplesDirectory + 'wrong'
      })
    }).toThrow()

    const sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFile + 'wrong',
      samplesPath: SamplesDirectory
    })
    result = await sIndex1.load()
    expect(result).toEqual(false)
    expect(function () { sIndex1.forEach(() => {}) }).toThrow()
    expect(function () { sIndex1.size }).toThrow()

    const sIndex2 = new SampleIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    result = await sIndex2.load()
    expect(result).toEqual(false)
    expect(function () { sIndex2.forEach(() => {}) }).toThrow()
    expect(function () { sIndex2.size }).toThrow()

    fileUtils.writeTextFileSync(SampleIndexFile, '')
    result = await sIndex2.load()
    expect(result).toEqual(false)
    expect(function () { sIndex2.forEach(() => {}) }).toThrow()
    expect(function () { sIndex2.size }).toThrow()

    result = await sIndex2.create()
    expect(result).toEqual(true)
    expect(function () { sIndex2.forEach(() => {}) }).not.toThrow()
    expect(sIndex2.size).toEqual(13)

    const sIndex3 = new SampleIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    result = await sIndex3.load()
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(13)

    sIndex2.forEach(({ item }) => {
      expect(item.relRoot).toEqual(SamplesDirectory)
    })

    result = await sIndex3.create({ includedExtensions: ['wav', 'json'] })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(6)

    result = await sIndex3.create({ excludedExtensions: ['wav', 'json'] })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(7)

    result = await sIndex3.create({
      excludedPaths: [
        path.join(SamplesDirectory, 'directory1', 'directory3'),
        path.join(SamplesDirectory, 'directory6')
      ]
    })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(8)

    result = await sIndex3.create({
      excludedExtensions: ['json', 'wav'],
      excludedPaths: [
        path.join(SamplesDirectory, 'directory1', 'directory3'),
        path.join(SamplesDirectory, 'directory6')
      ]
    })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(3)

    result = await sIndex3.create({
      includedExtensions: ['json', 'wav'],
      excludedPaths: [
        path.join(SamplesDirectory, 'directory1', 'directory3'),
        path.join(SamplesDirectory, 'directory6')
      ]
    })
    expect(result).toEqual(true)
    expect(function () { sIndex3.forEach(() => {}) }).not.toThrow()
    expect(sIndex3.size).toEqual(5)

    fileUtils.writeTextFileSync(SampleIndexFile, '')
  })
})
