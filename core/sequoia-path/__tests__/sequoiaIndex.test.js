const path = require('path')
const { SampleIndex } = require('../sequoiaIndex.class.old')

const SampleIndexFile = path.join(__dirname, 'new_samples_index')
const SamplesDirectory = path.join(path.resolve(path.join(__dirname, '..', '..', '__tests__')), 'test_dir')
const SampleIndexFileWrongJson = path.join(__dirname, 'test_dir', 'fixed_samples_index_wrong_json')
const SampleIndexFileEmpty = path.join(__dirname, 'test_dir', 'fixed_samples_index_empty')
const SampleIndexFileNotExists = path.join(__dirname, 'test_dir', 'fixed_samples_index_not_exists')

describe('SampleIndex functions', function () {
  beforeAll(function () {

  })
  afterAll(function () {

  })

  it('should throw some errors', async function () {})

  it('should have empty values when tree is not loaded', async function () {})
  it('should read simple directory', async function () {})
  it('should read from empty json', async function () {})
  it('should match two equal trees', async function () {})
  it('should loop on a tree', async function () {})
  it('should walk in a tree', async function () {})

  it('should load an empty file', async function () {})
  it('should load a full file', async function () {})

  it('should not save an empty file and remove it', async function () {})
  it('should save a full file', async function () {})

  // size, isLoaded in each test
  // clean at the end

  it('should create a sample index', async function () {
    let result
    await expect((async function () {
      const tmpIndex = new SampleIndex({
        indexFilePath: SampleIndexFile,
        samplesPath: SamplesDirectory + 'wrong'
      })
      return tmpIndex.create()
    })()).rejects.toThrow()

    const sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFile + 'wrong',
      samplesPath: SamplesDirectory
    })
    result = await sIndex1.load()
    expect(result).toEqual(false)
    // expect(async function () { await sIndex1.forEach(() => {}) }).toThrow()
    expect(sIndex1.size).toEqual(-1)

    const sIndex2 = new SampleIndex({
      indexFilePath: SampleIndexFile,
      samplesPath: SamplesDirectory
    })
    result = await sIndex2.load()
    expect(result).toEqual(false)
    // expect(function () { sIndex2.forEach(() => {}) }).toThrow()
    expect(sIndex2.size).toEqual(-1)

    result = await sIndex2.load()
    expect(result).toEqual(false)
    // expect(function () { sIndex2.forEach(() => {}) }).toThrow()
    expect(sIndex2.size).toEqual(-1)

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
  })

  it('should support file problems', function () {
    let sIndex1

    sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFileWrongJson,
      samplesPath: __dirname
    })
    expect(sIndex1.isLoaded).toEqual(false)

    sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFileEmpty,
      samplesPath: __dirname
    })
    expect(sIndex1.isLoaded).toEqual(false)

    sIndex1 = new SampleIndex({
      indexFilePath: SampleIndexFileNotExists,
      samplesPath: __dirname
    })
    expect(sIndex1.isLoaded).toEqual(false)
  })
})
