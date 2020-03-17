const { JsonFileButler } = require('./index')
const { JsonArrayType } = require('./types/jsonArrayType')
const { JsonObjectType } = require('./types/jsonObjectType')

class JsonCollectionFile {
  constructor ({ filePath, orderType = 'ASC', collectionType = 'object', collectionMaxSize, itemsClass }) {
    /**
     * The collection object
     * @type {JsonObjectType | JsonArrayType}
     */
    this.collection = null

    /**
     * The file manager for this collection
     * @type {JsonFileButler}
     */
    this.fileHolder = null

    if (!filePath) throw Error('Missing mandatory argument: filePath')
    if (!itemsClass) throw Error('Missing mandatory argument: itemsClass')

    if (!itemsClass.prototype.isValid) throw TypeError(`Class '${itemsClass.name}' must have isValid method`)
    if (!itemsClass.prototype.toJson) throw TypeError(`Class '${itemsClass.name}' must have toJson method`)
    if (!itemsClass.prototype.fromJson) throw TypeError(`Class '${itemsClass.name}' must have fromJson method`)

    this._collectionType = ['array', 'object'].indexOf(collectionType) === -1 ? 'object' : collectionType
    this._collectionIsArray = this._collectionType === 'array'
    this._collectionIsObject = this._collectionType === 'object'
    if (this._collectionIsArray) {
      this.collection = new JsonArrayType({ orderType, itemsClass, collectionMaxSize })
    } else if (this._collectionIsObject) {
      this.collection = new JsonObjectType({ orderType, itemsClass })
    }

    this.fileHolder = new JsonFileButler({
      filePath: filePath,
      fileType: 'json',
      loadFn: (fileData) => {
        if (!fileData) return null
        if (this._collectionIsArray) {
          if (!fileData.array || fileData.array.length === 0) return null
          this.collection.fromJson(fileData.array)
        } else if (this._collectionIsObject) {
          this.collection.fromJson(fileData)
        }
        return fileData
      },

      saveFn: () => {
        let fileData
        if (this._collectionIsArray) {
          fileData = { array: this.collection.toJson() }
          if (fileData.array.length === 0) fileData = null
        } else if (this._collectionIsObject) {
          fileData = this.collection.toJson()
        }
        return fileData
      }
    })
  }
}

module.exports = {
  JsonCollectionFile
}
