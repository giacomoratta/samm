class PathInfoError extends Error {
  constructor (message) {
    super()
    this.name = 'PathInfoError'
    this.message = message
  }
}

module.exports = {
  PathInfoError
}
