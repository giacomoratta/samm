class PathInfoError extends Error {
  constructor (message, errors) {
    super()
    this.name = 'PathInfoError'
    this.message = message
    this.errors = errors
  }
}

module.exports = {
  PathInfoError
}
