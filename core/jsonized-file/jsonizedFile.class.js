const JsonizedFileError = require('./jsonizedFileError.class')
const { DataField } = require('../data-field')
const { FileButler } = require('../file-butler')

class JsonizedFile {
  constructor () {
    this.fields = {}
    this.fileHolder = null
  }

  addField ({ name, schema, value }) {
    if (this.fields[name]) {
      throw new JsonizedFileError(`Field ${name} already exists. Remove it first`)
    }
    this.fields[name] = new DataField({ name, schema, value })
  }

  getField (name) {
    return this.fields[name]
  }

  removeField (name) {
    delete this.fields[name]
  }

  get (name) {
    if (!this.fields[name]) return
    return this.fields[name].get()
  }

  set (name, value) {
    if (!this.fields[name]) return null
    return this.fields[name].set(value)
  }

  toObject () {
    const finalObject = {}
    Object.keys(this.fields).forEach((k) => {
      finalObject[k] = this.fields[k].get(false)
    })
    return finalObject
  }

  setFileHolder (options) {

  }

  save () {
    // const f = this.toObject
    // this.fileButler.save...
  }
}

module.exports = JsonizedFile
