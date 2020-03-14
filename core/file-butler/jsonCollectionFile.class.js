const { JsonFileButler } = require('./index')
const { JsonArrayType } = require('./types/jsonArrayType')
const { JsonObjectType } = require('./types/jsonObjectType')

class JsonCollectionFile {
  constructor ({ filePath, orderType = 'ASC', collectionType = 'object', collectionMaxLength, itemsClass }) {
    this.collection = null
    this.itemsClass = itemsClass

    if (!itemsClass.prototype.isValid) throw TypeError(`Class '${itemsClass.name}' must have isValid method`)
    if (!itemsClass.prototype.toJson) throw TypeError(`Class '${itemsClass.name}' must have toJson method`)
    if (!itemsClass.prototype.fromJson) throw TypeError(`Class '${itemsClass.name}' must have fromJson method`)

    this._collectionType = ['array', 'object'].indexOf(collectionType) === -1 ? 'object' : collectionType
    this._collectionIsArray = this._collectionType === 'array'
    this._collectionIsObject = this._collectionType === 'object'
    if (this._collectionIsArray) {
      this.collection = new JsonArrayType({ orderType, itemsClass, collectionMaxLength })
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
          this.collection.clean()
          fileData.array.forEach((item) => {
            const dataObject = new this.itemsClass()
            dataObject.fromJson(item)
            this.collection.add(dataObject)
          })
        } else if (this._collectionIsObject) {
          this.collection.clean()
          Object.keys(fileData).forEach((key) => {
            const dataObject = new this.itemsClass()
            dataObject.fromJson(fileData[key])
            this.collection.add(key, dataObject)
          })
        }
        return fileData
      },

      saveFn: () => {
        let fileData
        if (this._collectionIsArray) {
          fileData = { array: [] }
          this.collection.forEach((i, dataObject) => {
            fileData.array.push(dataObject.toJson())
          })
          if (fileData.array.length === 0) fileData = null
        } else if (this._collectionIsObject) {
          fileData = {}
          this.collection.forEach((key, dataObject) => {
            fileData[key] = dataObject.toJson()
          })
        }
        return fileData
      }
    })
  }
}

module.exports = {
  JsonCollectionFile
}
