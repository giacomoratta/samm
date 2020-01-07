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

class SampleIndex {
  constructor ({ indexFilePath, samplesPath }) {
    if (!fileUtils.isAbsolutePath(indexFilePath)) {
      throw new SampleIndexError(`indexFilePath must be an absolute path: ${indexFilePath}`)
    }
    if (!fileUtils.isAbsolutePath(samplesPath)) {
      throw new SampleIndexError(`samplesPath must be an absolute path: ${samplesPath}`)
    }
    if (!fileUtils.directoryExistsSync(samplesPath)) {
      throw new SampleIndexError(`samplesPath does not exist: ${samplesPath}`)
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

  forEach (callback) {
    if (!this.sampleTree) {
      throw new SampleIndexError('Sample index is still not initialized; run \'createIndex\' method first')
    }
    this.sampleTree.forEach({
      itemFn: callback // callback({item})
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
}

module.exports = {
  SampleIndex
}
