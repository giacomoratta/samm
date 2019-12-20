const _ = require('../utils/lodash.extended')
const { parseOption } = require('./fileButler.utils')

// todo: replace custom function with events (check event finished and get returned data)

class FileButler {
  constructor (options) {
    this.config = parseOption(options)
    this.data = this.config.defaultValue
    this.load()
  }

  get () {
    return this.data
  }

  set (data) {
    if (this.config.fn.validityCheck(data) !== true) return false
    this.data = data
    return true
  }

  save () {
    return this.config.fn.saveToFile(this.config.filePath, this.data)
  }

  load () {
    let loadedData = this.config.fn.loadFromFile(this.config.filePath)
    if (_.isNil(loadedData)) loadedData = this.config.defaultValue
    this.data = loadedData
  }
}

module.exports = FileButler
