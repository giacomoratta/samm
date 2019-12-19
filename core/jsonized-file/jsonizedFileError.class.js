class JsonizedFileError extends Error {
  constructor (message) {
    super()
    this.message = message
  }
}

module.exports = JsonizedFileError
