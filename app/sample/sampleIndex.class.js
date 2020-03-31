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
    this.indexFilePath = indexFilePath
    this.samplesPath = samplesPath
    this.sampleTree = null
  }

  async create ({ includedExtensions = [], excludedExtensions = [], excludedPaths = [] } = {}) {
    if (!fileUtils.isAbsolutePath(this.indexFilePath)) {
      throw new SampleIndexError(`indexFilePath must be an absolute path: ${this.indexFilePath}`)
    }
    if (!fileUtils.isAbsolutePath(this.samplesPath)) {
      throw new SampleIndexError(`samplesPath must be an absolute path: ${this.samplesPath}`)
    }
    if (await fileUtils.directoryExists(this.samplesPath) !== true) {
      throw new SampleIndexError(`samplesPath does not exist: ${this.samplesPath}`)
    }
    // const parentSamplesPath = path.parse(this.samplesPath).dir
    // if (await fileUtils.directoryExists(parentSamplesPath) !== true) {
    //   throw new SampleIndexError(`samplesPath does not exist: ${parentSamplesPath}`)
    // }

    this.sampleTree = null
    let writeResult = await fileUtils.writeTextFile(this.indexFilePath, '') /* pre-write test */
    if (writeResult !== true) return false
    this.sampleTree = new SequoiaPath(this.samplesPath, {
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
    this.sampleTree = new SequoiaPath(this.samplesPath, {
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
    const result = await fileUtils.removeFile(this.indexFilePath).catch(e => { })
    return result === true
  }
}

module.exports = {
  SampleIndex
}
