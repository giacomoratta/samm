const { JsonizedFileError } = require('./jsonizedFileError.class')
const { JsonFileButler } = require('../file-butler')

class JsonizedFile {
  constructor ({ filePath = '', prettyJson = false, sortedFields = false }) {
    this.filePath = filePath
    this.options = { }
    this.options.prettyJson = prettyJson
    this.options.sortedFields = sortedFields
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

    this._fieldNameCompareFn = function (a, b) {
      a = a.toLowerCase()
      b = b.toLowerCase()
      return a.localeCompare(b)
    }
  }

  add (dataField) {
    if (this.fields[name]) {
      throw new JsonizedFileError(`Field ${name} already exists. Remove it first`)
    }
    this.fields[name] = dataField
    return true
  }

  has (name) {
    return (this.fields[name] !== null && this.fields[name] !== undefined)
  }

  field (name) {
    return this.fields[name]
  }

  fieldsCount () {
    return Object.keys(this.fields).length
  }

  fieldsList ({ writableOnly = false } = {}) {
    let fieldsList = []
    if (writableOnly === true) {
      Object.keys(this.fields).forEach((k) => {
        if (this.fields[k].schema.readOnly === true) return
        fieldsList.push(k)
      })
    } else {
      fieldsList = Object.keys(this.fields)
    }
    if (this.options.sortedFields === true) fieldsList.sort(this._fieldNameCompareFn)
    return fieldsList
  }

  remove (name) {
    delete this.fields[name]
    return true
  }

  toJson () {
    const finalObject = {}
    const fieldsList = Object.keys(this.fields)
    if (this.options.sortedFields === true) fieldsList.sort(this._fieldNameCompareFn)
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
        this.fields[k].rawValue = data[k]
      } catch (e) {
        this.fields[k].unset = true
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
