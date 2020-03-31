const { fileUtils } = require('../utils/file.utils')
const { SequoiaPath } = require('./index')
const { SampleInfo } = require('../../app/sample/sampleInfo.class')

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
    this._sampleTree = null
  }

  /**
   * Scan the entire samplesPath, then create and save an index file for samples.
   * Returns true if some samples have been found and indexed, otherwise false.
   * Any other bad outcomes will be thrown.
   * @param {array<string>} includedExtensions
   * @param {array<string>} excludedExtensions
   * @param {array<string>} excludedPaths
   * @throws SampleIndexError
   * @returns {Promise<boolean>}
   */
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

    /* pre-write test for indexFile to avoid launching (heavy) indexing if it is not possible to write its results */
    if (await fileUtils.writeTextFile(this.indexFilePath, '') !== true) {
      throw new SampleIndexError(`Cannot write on index file: ${this.indexFilePath}`)
    }

    this._sampleTree = null
    this._sampleTree = new SequoiaPath(this.samplesPath, {
      includedExtensions,
      excludedExtensions,
      excludedPaths,
      ObjectClass: SampleInfo
    })
    await this._sampleTree.read()
    if (this._sampleTree.fileCount === 1) return false
    if (await fileUtils.writeJsonFile(this.indexFilePath, this._sampleTree.toJson()) !== true) {
      throw new SampleIndexError(`Cannot write on index file: ${this.indexFilePath}`)
    }
    return true
  }

  /**
   * Loads sample index from file.
   * Returns false if, for different reasons, it is not possible to read or get data from index file.
   * Return true if index file has been read successfully but it does no mean that there are indexed samples found.
   * @returns {Promise<boolean>}
   */
  async load () {
    this._sampleTree = null
    const fExists = await fileUtils.fileExists(this.indexFilePath)
    if (fExists !== true) return false
    const jsonSampleTree = await fileUtils.readJsonFile(this.indexFilePath)
    if (!jsonSampleTree) return false
    this._sampleTree = new SequoiaPath(this.samplesPath, {
      ObjectClass: SampleInfo
    })
    this._sampleTree.fromJson(jsonSampleTree)
    return true
  }

  /**
   * Loops on samples
   * @param {function({item})} callback
   */
  forEach (callback) {
    if (!this._sampleTree) return
    this._sampleTree.forEach({
      itemFn: callback
    })
  }

  /**
   * Get number of indexed samples, or -1 if index is not present.
   * @returns {number}
   */
  get size () {
    if (!this._sampleTree) return -1
    return this._sampleTree.fileCount
  }

  /**
   * Check if index is loaded and present
   * @returns {boolean}
   */
  get isLoaded () {
    return this._sampleTree !== null && this._sampleTree !== undefined
  }

  /**
   * Deletes the index and its index file.
   * Returns true if index file is removed successfully.
   * @returns {Promise<boolean>}
   */
  async clean () {
    this._sampleTree = null
    try {
      await fileUtils.removeFile(this.indexFilePath)
      return true
    } catch (e) {
      return false
    }
  }

  // save+load with _indexCheck and exceptions
  // isLoaded
  // doc!
}

module.exports = {
  SampleIndex
}
