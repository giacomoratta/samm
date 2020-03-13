const { JsonFileButler } = require('../../core/file-butler')

class JsonCollectionFile {
  constructor (filePath) {
    this._collection = {}
    this._length = 0

    this.fileHolder = new JsonFileButler({
      filePath: filePath,
      fileType: 'json',
      loadFn: (data) => {
        this._collection = {}
        if (!data) return null
        Object.keys(data).forEach((key) => {
          this.add(key, this.fromJson((data[key])))
        })
        return data
      },
      saveFn: () => {
        this.fileHolder.sortFields()
        const data = {}
        Object.keys(this._collection).forEach((key) => {
          data[key] = this.toJson(this._collection[key])
        })
        return data
      }
    })
  }

  get collection () {
    return this._collection
  }

  get length () {
    return this._length
  }

  add (label, dataObject) {
    this._collection[label] = dataObject
    this._length = Object.keys(this._collection).length
    return true
  }

  get (label) {
    return this._collection[label]
  }

  has (label) {
    return (this._collection[label] !== undefined && this._collection[label] !== null)
  }

  remove (label) {
    delete this._collection[label]
    this._length = Object.keys(this._collection).length
    return true
  }

  forEach (fn) {
    Object.keys(this._collection).forEach((key) => {
      fn(this._collection[key])
    })
  }

  /**
   * To be implemented
   * @param jsonData
   */
  fromJson (jsonData) {
    // return dataObject
  }

  /**
   * To be implemented
   * @param dataObject
   */
  toJson (dataObject) {
    // return jsonData
  }
}

module.exports = {
  JsonCollectionFile
}
