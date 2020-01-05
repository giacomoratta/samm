const { JsonizedFile } = require('../../core/jsonized-file')

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }

  statusMessages () {
    const statusFlags = this.get('Status')
    let statusMessages = []
    if (statusFlags['first-scan-needed'] === true) {
      statusMessages.push('First samples scan needed before start using the app')
    } else if (statusFlags['new-scan-needed'] === true) {
      statusMessages.push('New samples scan needed to keep using the app')
    }
    return statusMessages
  }
}

module.exports = {
  ConfigFile
}
