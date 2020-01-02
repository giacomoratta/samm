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
  constructor ({ indexPath, samplesPath }) {
    if(!fileUtils.isAbsolutePath(indexPath)) {
      throw new SamplesIndexError(`indexPath must be an absolute path: ${indexPath}`)
    }
    if(!fileUtils.isAbsolutePath(samplesPath)) {
      throw new SamplesIndexError(`samplesPath must be an absolute path: ${samplesPath}`)
    }
    if(!fileUtils.directoryExistsSync(samplesPath)) {
      throw new SamplesIndexError(`samplesPath does not exist: ${samplesPath}`)
    }
    this.indexPath = indexPath
    this.samplesPath = samplesPath
  }

  createIndex () {
    // sequoiaPath
    // save
  }

  size () {
    // sequoiaPath size
  }


}
