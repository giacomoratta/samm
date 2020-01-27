const { _ } = require('../utils/lodash.extended')
const { FileButlerError } = require('./fileButlerError.class')
const { fileButlerBase } = require('fileButlerBase.class')

const ENUMS = {
  fileType: {
    json: 'json',
    json_compact: 'json-compact'
  }
}

class jsonFileButler extends fileButlerBase {

  constructor (options) {

    if (!options) {
      throw new FileButlerError(`Missing options`)
    }

    if(!options.fileType) options.fileType = 'json-compact'

    if (!options.fileType || !Object.values(ENUMS.fileType).includes(options.fileType)) {
      throw new FileButlerError(`'fileType' option must be present and have one of these values: ${Object.values(ENUMS.fileType).join(', ')} .`)
    }

    options.defaultValue = null
    options.fileEncoding = 'utf8'
    options.fileReadFlag = 'r'
    options.fileWriteFlag = 'w'
    options.fileMode = 0o666

    options.readFileFn = function(data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        return null
      }
    }

    options.writeFileFn = function(data) {
      try {
        if(options.fileType === ENUMS.fileType.json) {
          return JSON.stringify(data, null, '\t')
        } else if(options.fileType === ENUMS.fileType.json_compact) {
          return JSON.stringify(data, null)
        }
      } catch (e) {
        return ''
      }
    }

    options.validityCheck = function(data) {
      return _.isStrictObject(data)
    }

    super(options)
  }
}

module.exports = {
  jsonFileButler
}
