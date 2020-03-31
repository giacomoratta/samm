class SequoiaPathError extends Error {
  constructor (message, errors) {
    super()
    this.name = 'SequoiaPathError'
    this.message = message
    this.errors = errors
  }
}

module.exports = {
  SequoiaPathError
}
