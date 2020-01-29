const { FileButlerError } = require('./fileButlerError.class')
const { FileButlerBase } = require('fileButlerBase.class')

class TextFileButler extends FileButlerBase {
  constructor (options) {
    if (!options) {
      throw new FileButlerError('Missing options')
    }

    options.fileType = 'text'
    options.defaultValue = ''
    options.fileEncoding = 'utf8'
    options.fileReadFlag = 'r'
    options.fileWriteFlag = 'w'
    options.fileMode = 0o666

    options.readFileFn = function (data) {
      if (typeof data !== 'string') return ''
      return data
    }

    options.writeFileFn = function (data) {
      if (typeof data !== 'string') return ''
      return data
    }

    options.validityCheck = function (data) {
      return (typeof data === 'string')
    }

    super(options)
  }
}

module.exports = {
  TextFileButler
}
