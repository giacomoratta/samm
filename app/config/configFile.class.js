const { JsonizedFile } = require('../../core/jsonized-file')

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
    this._loadError = null
  }

  errors () {
    const _errors = {}
    if (this._loadError !== null) _errors.loadError = this._loadError
    return _errors
  }

  reset () {
    this._loadError = null
    this.deleteFile()
    return this.load()
  }

  load () {
    if (this._loadError !== null) return this._loadError
    try {
      super.load()
    } catch (e) {
      this._loadError = e
      return e
    }
    this._loadError = null
    return true
  }
}

module.exports = {
  ConfigFile
}
