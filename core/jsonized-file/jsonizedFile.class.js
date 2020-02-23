const { JsonizedFileError } = require('./jsonizedFileError.class')
const { JsonFileButler } = require('../file-butler')

class JsonizedFile {
  constructor ({ filePath = '', prettyJson = false, sortedFields = false }) {
    this.options = { }
    this.options.prettyJson = prettyJson
    this.options.sortedFields = sortedFields
    this.fields = {}
    this.beforeLoadFn = null

    this.fileHolder = new JsonFileButler({
      filePath: filePath,
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
    if (this.fields[dataField.name]) {
      throw new JsonizedFileError(`Field ${dataField.name} already exists. Remove it first`)
    }
    this.fields[dataField.name] = dataField
    return true
  }

  has (name) {
    return (this.fields[name] !== null && this.fields[name] !== undefined)
  }

  field (name) {
    return this.fields[name]
  }

  length () {
    return Object.keys(this.fields).length
  }

  list ({ writableOnly = false } = {}) {
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
      finalObject[k] = this.fields[k].valueRef
      if (finalObject[k] === null) delete finalObject[k]
    })
    return finalObject
  }

  fromJson (data) {
    Object.keys(data).forEach((k) => {
      if (!this.fields[k]) return
      try {
        this.fields[k].valueRef = data[k]
      } catch (e) {
        this.fields[k].unset = true
        throw e
      }
    })
    return data
  }

  get jsonData () {
    return this.fileHolder.data
  }

  get isEmpty () {
    return this.fileHolder.isEmpty
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
    await this.fileHolder.delete()
    Object.keys(this.fields).forEach((k) => {
      this.fields[k].reset()
    })
    await this.save()
  }

  async clean () {
    try {
      const keys = Object.keys(this.fields)
      for (let i = 0; i < keys.length; i++) {
        this.fields[keys[i]].fn.clean && await this.fields[keys[i]].fn.clean()
      }
      return await this.fileHolder.delete()
    } catch (e) {
      throw new JsonizedFileError(e.message)
    }
  }
}

module.exports = {
  JsonizedFile
}
