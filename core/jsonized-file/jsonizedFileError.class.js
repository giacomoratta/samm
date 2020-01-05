class JsonizedFileError extends Error {
  constructor (message) {
    super()
    this.name = 'JsonizedFileError'
    this.message = message
  }
}

module.exports = {
  JsonizedFileError
}
