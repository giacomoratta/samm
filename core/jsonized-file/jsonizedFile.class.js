const { JsonizedFileError } = require('./jsonizedFileError.class')
const { DataField } = require('../data-field')
const { FileButler } = require('../file-butler')

class JsonizedFile {
  constructor ({ filePath = '', prettyJson = false, orderedFields = false }) {
    this.filePath = filePath
    this.options = { }
    this.options.prettyJson = prettyJson
    this.options.orderedFields = orderedFields
    this.fields = {}
    this.fileHolder = null
    this.beforeLoadFn = null
  }

  addField ({ name, schema, value, description }) {
    if (this.fields[name]) {
      throw new JsonizedFileError(`Field ${name} already exists. Remove it first`)
    }
    this.fields[name] = new DataField({ name, schema, value, description })
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

  isUnset (name) {
    if (!this.fields[name]) return
    return this.fields[name].isUnset()
  }

  toObject () {
    const finalObject = {}
    const fieldList = Object.keys(this.fields)
    if (this.options.orderedFields === true) fieldList.sort()
    fieldList.forEach((k) => {
      finalObject[k] = this.fields[k].get(false)
      if (finalObject[k] === null) delete finalObject[k]
    })
    return finalObject
  }

  fromObject (data) {
    Object.keys(data).forEach((k) => {
      if (!this.fields[k]) return
      try {
        this.fields[k].set(data[k], { overwrite: true })
      } catch (e) {
        this.fields[k].unset()
        throw e
      }
    })
  }

  load () {
    const options = {}
    options.filePath = this.filePath
    options.fileType = (this.options.prettyJson ? 'json' : 'json-compact')
    options.loadFn = (data) => {
      if (!data) return
      if (this.beforeLoadFn) data = this.beforeLoadFn(data)
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

  hasData () {
    return this.fileHolder !== null && this.fileHolder.hasData
  }

  save () {
    if (!this.fileHolder) return false
    return this.fileHolder.save()
  }

  reset () {
    this.deleteFile()
    Object.keys(this.fields).forEach((k) => {
      this.fields[k].reset()
    })
    this.save()
  }

  deleteFile () {
    const tempFileHolder = (this.fileHolder ? this.fileHolder : new FileButler({
      filePath: this.filePath,
      fileType: (this.options.prettyJson ? 'json' : 'json-compact')
    }))
    return tempFileHolder.delete()
  }
}

module.exports = {
  JsonizedFile
}
