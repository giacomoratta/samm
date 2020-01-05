class FileButlerError extends Error {
  constructor (message) {
    super()
    this.message = message
    this.name = 'FileButlerError'
  }
}

module.exports = {
  FileButlerError
}
