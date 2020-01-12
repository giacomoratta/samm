const { JsonizedFile } = require('../../core/jsonized-file')

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }
}

module.exports = {
  ConfigFile
}
