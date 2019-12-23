const JsonizedFileError = require('./jsonizedFileError.class')
const { DataField } = require('../data-field')
const { FileButler } = require('../file-butler')

class JsonizedFile {
  constructor ({ filePath = '', prettyJson = false }) {
    this.filePath = filePath
    this.prettyJson = prettyJson
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

  getFieldList () {
    return Object.keys(this.fields)
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

  fromObject (data) {
    Object.keys(data).forEach((k) => {
      if (!this.fields[k]) return
      this.fields[k].set(data[k])
    })
  }

  load () {
    const options = {}
    options.filePath = this.filePath
    options.fileType = (this.prettyJson ? 'json' : 'json-compact')
    options.loadFn = (data) => {
      if (!data) return
      this.fromObject(data)
    }

    options.saveFn = () => {
      return this.toObject()
    }

    try {
      this.fileHolder = new FileButler(options)
    } catch (e) {
      throw new JsonizedFileError(e.message)
    }
  }

  save () {
    return this.fileHolder.save()
  }
}

module.exports = JsonizedFile
