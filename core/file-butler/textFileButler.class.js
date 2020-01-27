const { _ } = require('../utils/lodash.extended')
const { FileButlerError } = require('./fileButlerError.class')
const { fileButlerBase } = require('fileButlerBase.class')

class textFileButler extends fileButlerBase {

  constructor (options) {

    if (!options) {
      throw new FileButlerError(`Missing options`)
    }

    options.defaultValue = ''
    options.fileEncoding = 'utf8'
    options.fileReadFlag = 'r'
    options.fileWriteFlag = 'w'
    options.fileMode = 0o666

    options.readFileFn = function(data) {
      if(!_.isString(data)) return ''
      return data
    }

    options.writeFileFn = function(data) {
      if(!_.isString(data)) return ''
      return data
    }

    options.validityCheck = function(data) {
      return _.isString(data)
    }

    super(options)
  }
}

module.exports = {
  textFileButler
}
