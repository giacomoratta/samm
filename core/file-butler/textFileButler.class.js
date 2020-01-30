const FileButlerError = require('./fileButlerError.class')
const FileButler = require('core/file-butler/fileButler.class')

class TextFileButler extends FileButler {
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

    options.fileToDataFn = function (data) {
      if (typeof data !== 'string') return ''
      return data
    }

    options.dataToFileFn = function (data) {
      if (typeof data !== 'string') return ''
      return data
    }

    options.validityCheck = function (data) {
      if (typeof data !== 'string') {
        throw new FileButlerError('This data is not valid as text.')
      }
    }

    super(options)
  }
}

module.exports = TextFileButler
