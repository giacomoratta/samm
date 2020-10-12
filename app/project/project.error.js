class ProjectError extends Error {
  constructor (message) {
    super()
    this.name = 'ProjectError'
    this.message = message
  }
}

module.exports = {
  ProjectError
}
