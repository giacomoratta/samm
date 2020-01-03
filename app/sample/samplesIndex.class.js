const path = require('path')
const { JsonizedFile } = require('../../core/jsonized-file')
const { SequoiaPath } = require('../../core/sequoia-path')
const fileUtils = require('../../core/utils/file.utils')

class SamplesIndexError extends Error {
  constructor (message) {
    super()
    this.name = 'SamplesIndexError'
    this.message = message
  }
}

class SamplesIndex {
  constructor ({ indexFilePath, samplesPath }) {
    if (!fileUtils.isAbsolutePath(indexFilePath)) {
      throw new SamplesIndexError(`indexFilePath must be an absolute path: ${indexFilePath}`)
    }
    if (!fileUtils.isAbsolutePath(samplesPath)) {
      throw new SamplesIndexError(`samplesPath must be an absolute path: ${samplesPath}`)
    }
    if (!fileUtils.directoryExistsSync(samplesPath)) {
      throw new SamplesIndexError(`samplesPath does not exist: ${samplesPath}`)
    }
    this.indexFilePath = indexFilePath
    this.samplePath = samplesPath
    this.sampleTree = null
  }

  async createIndex ({ includedExtensions, excludedExtensions, excludedPaths }) {
    await fileUtils.writeTextFile(this.indexFilePath, '')
    this.sampleTree = new SequoiaPath(this.samplePath, {
      includedExtensions,
      excludedExtensions,
      excludedPaths
    })
    await this.sampleTree.read()
    if (this.sampleTree.fileCount() === 1) return false
    await fileUtils.writeJsonFile(this.indexFilePath, this.sampleTree.toJson())
  }

  async loadIndex () {
    if (!fileUtils.fileExistsSync(this.indexFilePath)) return false
    this.sampleTree = new SequoiaPath(this.samplePath)
    const jsonSampleTree = await fileUtils.readJsonFile(this.indexFilePath)
    this.sampleTree.fromJson(jsonSampleTree)
    return true
  }

  forEach (fn) {
    if (!this.sampleTree) {
      throw new SamplesIndexError('Sample index is still not initialized; run \'createIndex\' method first')
    }
    this.sampleTree.forEach({
      itemFn: fn
    })
  }

  size () {
    if (!this.sampleTree) {
      throw new SamplesIndexError('Sample index is still not initialized; run \'createIndex\' method first')
    }
    return this.sampleTree.nodeCount()
  }
}
