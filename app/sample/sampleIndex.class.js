const { SequoiaPath } = require('../../core/sequoia-path')
const { fileUtils } = require('../../core/utils/file.utils')
const { SampleInfo } = require('./sampleInfo.class')

class SampleIndexError extends Error {
  constructor (message) {
    super()
    this.name = 'SampleIndexError'
    this.message = message
  }
}

/**
 * Asynchronous manager for Sample Index files.
 * - sample directory might contain 100k+ files and walking this kind of directory might take time.
 * - index files might easily reach 10MB+ and r/w operations take time.
 */
class SampleIndex {
  constructor ({ indexFilePath, samplesPath }) {
    this.init({ indexFilePath, samplesPath })
  }

  init ({ indexFilePath, samplesPath }) {
    if (!fileUtils.isAbsolutePath(indexFilePath)) {
      throw new SampleIndexError(`indexFilePath must be an absolute path: ${indexFilePath}`)
    }
    if (!fileUtils.isAbsolutePath(samplesPath)) {
      throw new SampleIndexError(`samplesPath must be an absolute path: ${samplesPath}`)
    }
    if (!fileUtils.directoryExistsSync(samplesPath)) {
      throw new SampleIndexError(`samplesPath does not exist: ${samplesPath}`)
    }
    if (!fileUtils.parentDirectoryExistsSync(indexFilePath)) {
      throw new SampleIndexError(`Cannot create index file because of a missing parent path: ${indexFilePath}`)
    }
    this.indexFilePath = indexFilePath
    this.samplePath = samplesPath
    this.sampleTree = null
  }

  async create ({ includedExtensions = [], excludedExtensions = [], excludedPaths = [] } = {}) {
    this.sampleTree = null
    let writeResult = await fileUtils.writeTextFile(this.indexFilePath, '')
    if (writeResult !== true) return false
    this.sampleTree = new SequoiaPath(this.samplePath, {
      includedExtensions,
      excludedExtensions,
      excludedPaths,
      ObjectClass: SampleInfo
    })
    await this.sampleTree.read()
    if (this.sampleTree.fileCount() === 1) return false
    writeResult = await fileUtils.writeJsonFile(this.indexFilePath, this.sampleTree.toJson())
    return writeResult
  }

  async load () {
    this.sampleTree = null
    const fExists = await fileUtils.fileExists(this.indexFilePath)
    if (fExists !== true) return false
    const jsonSampleTree = await fileUtils.readJsonFile(this.indexFilePath)
    if (!jsonSampleTree) return false
    this.sampleTree = new SequoiaPath(this.samplePath, {
      ObjectClass: SampleInfo
    })
    this.sampleTree.fromJson(jsonSampleTree)
    return true
  }

  async forEach (callback) {
    if (!this.sampleTree) {
      throw new SampleIndexError('Sample index is still not initialized; run \'createIndex\' method first')
    }
    return new Promise((resolve) => {
      this.sampleTree.forEach({
        itemFn: callback // callback({item})
      })
      resolve(true)
    })
  }

  get size () {
    if (!this.sampleTree) {
      throw new SampleIndexError('Sample index is still not initialized; run \'createIndex\' method first')
    }
    return this.sampleTree.fileCount()
  }

  get loaded () {
    return this.sampleTree !== null && this.sampleTree !== undefined
  }

  async deleteFile () {
    const result =  await fileUtils.removeFile(this.indexFilePath).catch(e => { })
    return result === true
  }
}

module.exports = {
  SampleIndex
}
