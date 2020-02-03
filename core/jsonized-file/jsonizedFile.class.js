const { JsonizedFileError } = require('./jsonizedFileError.class')
const { DataField } = require('../data-field')
const { JsonFileButler } = require('../file-butler')

class JsonizedFile {
  constructor ({ filePath = '', prettyJson = false, orderedFields = false }) {
    this.filePath = filePath
    this.options = { }
    this.options.prettyJson = prettyJson
    this.options.orderedFields = orderedFields
    this.fields = {}
    this.beforeLoadFn = null

    this.fileHolder = new JsonFileButler({
      filePath: this.filePath,
      fileType: (this.options.prettyJson ? 'json' : 'json-compact'),
      loadFn: (data) => {
        if (!data) return null
        if (this.beforeLoadFn) data = this.beforeLoadFn(data)
        return this.fromJson(data)
      },
      saveFn: () => {
        return this.toJson()
      }
    })

    this.fieldsCompareFn = function (a, b) {
      a = a.toLowerCase()
      b = b.toLowerCase()
      return a.localeCompare(b)
    }
  }

  async addField ({ name, schema, value, description }) {
    if (this.fields[name]) {
      throw new JsonizedFileError(`Field ${name} already exists. Remove it first`)
    }
    try {
      this.fields[name] = new DataField({ name, schema, value, description })
    } catch (e) {
      throw new JsonizedFileError(e.message)
    }
    return true
  }

  hasField (name) {
    return (this.fields[name] !== null && this.fields[name] !== undefined)
  }

  getField (name) {
    return this.fields[name]
  }

  getFieldsCount () {
    return Object.keys(this.fields).length
  }

  getFieldsList ({ writableOnly = false } = {}) {
    let fieldsList = []
    if (writableOnly === true) {
      Object.keys(this.fields).forEach((k) => {
        if (this.fields[k].getSchema().readOnly === true) return
        fieldsList.push(k)
      })
    } else {
      fieldsList = Object.keys(this.fields)
    }
    if (this.options.orderedFields === true) fieldsList.sort(this.fieldsCompareFn)
    return fieldsList
  }

  removeField (name) {
    delete this.fields[name]
    return true
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

  clean (name) {
    if (!this.fields[name]) return
    return this.fields[name].clean()
  }

  toJson () {
    const finalObject = {}
    const fieldsList = Object.keys(this.fields)
    if (this.options.orderedFields === true) fieldsList.sort(this.fieldsCompareFn)
    fieldsList.forEach((k) => {
      finalObject[k] = this.fields[k].get(false)
      if (finalObject[k] === null) delete finalObject[k]
    })
    return finalObject
  }

  fromJson (data) {
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

  hasData () {
    return !this.fileHolder.isEmpty
  }

  async load () {
    try {
      return await this.fileHolder.load()
    } catch (e) {
      throw new JsonizedFileError(e.message)
    }
  }

  async save () {
    try {
      return await this.fileHolder.save()
    } catch (e) {
      throw new JsonizedFileError(e.message)
    }
  }

  async reset () {
    await this.deleteFile()
    Object.keys(this.fields).forEach((k) => {
      this.fields[k].reset()
    })
    await this.save()
  }

  async deleteFile () {
    try {
      return await this.fileHolder.delete()
    } catch (e) {
      throw new JsonizedFileError(e.message)
    }
  }
}

module.exports = {
  JsonizedFile
}
