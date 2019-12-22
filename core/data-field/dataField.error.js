class DataFieldError extends Error {
  constructor (errors) {
    super()
    this.name = 'DataFieldError'
    if (typeof errors === 'string') {
      this.errors = []
      this.message = errors
      return
    }
    this.errors = errors
    this.message = ''
    errors.forEach((e) => {
      this.message += `[${e.type}] ${e.message} - Invalid value: ${e.expected}\n`
    })

    /* Objects of 'errors' array:
           - type: 'required',
           - expected: undefined,
           - actual: undefined,
           - field: 'fieldAbc.id',
           - message: "The 'fieldAbc.id' field is required!"
        */
  }

  getByType (type) {
    return this.errors.filter(function (e) {
      return e.type === type
    })
  }

  getByField (field) {
    return this.errors.filter(function (e) {
      return e.field.endsWith(`.${field}`)
    })
  }
}

module.exports = DataFieldError
