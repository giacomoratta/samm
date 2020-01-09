const { JsonizedFileError } = require('./jsonizedFileError.class')
const { DataField } = require('../data-field')
const { FileButler } = require('../file-butler')

class JsonizedFile {
  constructor ({ filePath = '', prettyJson = false }) {
    this.filePath = filePath
    this.prettyJson = prettyJson
    this.fields = {}
    this.fileHolder = null
    this.preProcessRawDataFn = null
  }

  addField ({ name, schema, value, description }) {
    if (this.fields[name]) {
      throw new JsonizedFileError(`Field ${name} already exists. Remove it first`)
    }
    this.fields[name] = new DataField({ name, schema, value, description })
  }

  ensureField () {
    /* todo */
  }

  hasField (name) {
    return (this.fields[name] !== null && this.fields[name] !== undefined)
  }

  getField (name) {
    return this.fields[name]
  }

  getFieldList ({ writableOnly = false } = {}) {
    if (writableOnly === true) {
      const fieldList = []
      Object.keys(this.fields).forEach((k) => {
        if (this.fields[k].getSchema().readOnly === true) return
        fieldList.push(k)
      })
      return fieldList
    }
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

  unset (name) {
    if (!this.fields[name]) return
    return this.fields[name].unset()
  }

  toObject () {
    const finalObject = {}
    Object.keys(this.fields).forEach((k) => {
      finalObject[k] = this.fields[k].get(false)
      if (finalObject[k] === null) delete finalObject[k]
    })
    return finalObject
  }

  fromObject (data) {
    if (this.preProcessRawDataFn) data = this.preProcessRawDataFn(data)
    Object.keys(data).forEach((k) => {
      if (!this.fields[k]) return
      this.fields[k].set(data[k], { overwrite: true })
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

  deleteFile () {
    return this.fileHolder.delete()
  }
}

module.exports = {
  JsonizedFile
}
