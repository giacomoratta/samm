const FileButlerError = require('./fileButlerError.class')
const FileButler = require('./fileButler.class')

const DEFAULT_VALUE = null

const _compAZ = function (a, b) {
  a = a.toLowerCase()
  b = b.toLowerCase()
  return a.localeCompare(b)
}

const ENUMS = {
  fileType: {
    json: 'json',
    json_compact: 'json-compact'
  }
}

class JsonFileButler extends FileButler {
  constructor (options) {
    if (!options) {
      throw new FileButlerError('Missing options')
    }

    if (!options.fileType) options.fileType = 'json-compact'

    if (!options.fileType || !Object.values(ENUMS.fileType).includes(options.fileType)) {
      throw new FileButlerError(`'fileType' option must be present and have one of these values: ${Object.values(ENUMS.fileType).join(', ')} .`)
    }

    options.defaultValue = DEFAULT_VALUE
    options.fileEncoding = 'utf8'
    options.fileReadFlag = 'r'
    options.fileWriteFlag = 'w'
    options.fileMode = 0o666

    options.fileToDataFn = function (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        return DEFAULT_VALUE
      }
    }

    options.dataToFileFn = function (data) {
      try {
        if (options.fileType === ENUMS.fileType.json) {
          return JSON.stringify(data, null, '\t')
        } else if (options.fileType === ENUMS.fileType.json_compact) {
          return JSON.stringify(data, null)
        }
      } catch (e) {
        return DEFAULT_VALUE
      }
    }

    options.validityCheck = function (data) {
      if (data === null) return true
      if (typeof data !== 'object' || !(data instanceof Object) || data.constructor !== Object) {
        throw new FileButlerError('This data is not valid as json.')
      }
      return true
    }

    options.emptyCheck = function (data) {
      return !data || Object.keys(data).length === 0
    }

    super(options)
  }

  sortFields () {
    if (this.empty === true) return
    const fieldsList = Object.keys(this.data)
    fieldsList.sort(_compAZ)
    const sortedData = {}
    fieldsList.forEach((key) => {
      sortedData[key] = this.data[key]
    })
    this.data = sortedData
  }
}

module.exports = JsonFileButler
