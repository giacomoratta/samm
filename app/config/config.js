const { JsonizedFile } = require('../../core/jsonized-file')

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }

  statusMessages () {
    const statusFlags = this.get('Status')
    let statusMessages = ''
    if (statusFlags['first-scan-needed'] === true) {
      statusMessages += 'First samples scan needed before start using the app. \n'
    } else if (statusFlags['new-scan-needed'] === true) {
      statusMessages += 'New samples scan needed to keep using the app. \n'
    }
    return statusMessages
  }
}

module.exports = {
  ConfigFile
}
