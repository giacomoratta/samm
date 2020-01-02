const path = require('path')
const { JsonizedFile } = require('../../core/jsonized-file')
const { SequoiaPath } = require('../../core/sequoia-path')
const fileUtils = require('../../core/utils/file.utils')

class SamplesSetError extends Error {
  constructor (message) {
    super()
    this.name = 'SamplesIndexError'
    this.message = message
  }
}

class SamplesSet {
  constructor () {
  }

  add () {
    // validityCheck
  }

  remove(item) {

  }

  size () {
  }


}
