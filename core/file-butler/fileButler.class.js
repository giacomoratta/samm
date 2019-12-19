const _ = require('../utils/lodash.extended')
const { ENUMS, parseOption } = require('./utils')

// todo: replace custom function with events (check event finished and get returned data)

class FileButler {
  constructor (options) {
    this.config = parseOption(options)
    this.data = { }
  }
}

module.exports = FileButler
