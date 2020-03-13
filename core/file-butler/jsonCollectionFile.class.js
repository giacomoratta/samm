const { JsonFileButler } = require('./index')
const { JsonArrayType } = require('./types/jsonArrayType')
const { JsonObjectType } = require('./types/jsonObjectType')

class JsonCollectionFile {
  constructor ({ filePath, orderType = 'ASC', collectionType = 'object' }) {
    this.collection = null

    this._collectionType = ['array', 'object'].indexOf(collectionType) === -1 ? 'object' : collectionType
    this._collectionIsArray = this._collectionType === 'array'
    this._collectionIsObject = this._collectionType === 'object'
    if (this._collectionIsArray) {
      this.collection = new JsonArrayType({ orderType })
    } else if (this._collectionIsObject) {
      this.collection = new JsonObjectType({ orderType })
    }

    this.fileHolder = new JsonFileButler({
      filePath: filePath,
      fileType: 'json',
      loadFn: (data) => {
        if (!data || !data.array || data.array.length === 0) return null
        if (this._collectionIsArray) {
          this.collection = new JsonArrayType({ orderType })
          data.array.forEach((item) => {
            this.collection.add(this.fromJson(item))
          })
        } else if (this._collectionIsObject) {
          this.collection = new JsonObjectType({ orderType })
          Object.keys(data).forEach((key) => {
            this.collection.add(key, this.fromJson(data[key]))
          })
        }
        return data
      },
      saveFn: () => {
        let data
        if (this._collectionIsArray) {
          data = { array: [] }
          this.collection.forEach((i, dataObject) => {
            data.array.push(this.toJson(dataObject))
          })
          if (data.array.length === 0) data = null
        } else if (this._collectionIsObject) {
          data = {}
          this.collection.forEach((key, dataObject) => {
            data[key] = this.toJson(dataObject)
          })
        }
        return data
      }
    })
  }

  // get length () {
  //   return this.collection.length
  // }

  // add (dataObject, ki) {
  //   this.collection.add(dataObject, ki)
  //   return true
  // }

  // get (label) {
  //   return this._collection[label]
  // }
  //
  // has (label) {
  //   return (this._collection[label] !== undefined && this._collection[label] !== null)
  // }
  //
  // remove (label) {
  //   delete this._collection[label]
  //   this._length = Object.keys(this._collection).length
  //   return true
  // }

  // forEach (fn) {
  //   Object.keys(this._collection).forEach((key) => {
  //     fn(this._collection[key])
  //   })
  // }

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
