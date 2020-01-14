const _ = require('lodash')
const { JsonizedFile } = require('../../core/jsonized-file')
const { SampleInfo } = require('./../sample/sampleInfo.class')

class BookmarksJsonFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true, orderedFields: true })

    // create fields dynamically
    this.beforeLoadFn = (data) => {
      Object.keys(data).forEach((key) => {
        this.removeField(key)
        this._createBookmarkTagField(key)
      })
      return data
    }
  }

  _createBookmarkTagField (tag) {
    this.addField({
      name: tag,
      schema: {
        type: 'array',
        items: {
          type: 'object',
          props: {
            path: { type: 'absFilePath' },
            name: { type: 'string' }
          }
        },
        default: []
      }
    })
  }

  addBookmark (tag, sample) {
    if (!(sample instanceof SampleInfo)) {
      throw new TypeError('sample argument is not instance of SampleInfo')
    }
    if (!this.hasField(tag)) {
      this._createBookmarkTagField(tag)
    }
    this.getField(tag).add({
      name: sample.name,
      path: sample.path,
      relPath: sample.relPath
    })
  }

  _findBookmark (tag, sample) {
    if (!(sample instanceof SampleInfo)) {
      throw new TypeError('bookmark argument is not instance of SampleInfo')
    }
    const tagCollection = this.get(tag)
    if (tagCollection === null) return -1
    const foundIndex = tagCollection.findIndex((bookmark) => {
      return bookmark.path === sample.path
    })
    if (foundIndex < 0) return -1
    return foundIndex
  }

  hasBookmark (tag, sample) {
    return this._findBookmark(tag, sample) >= 0
  }

  removeBookmark (tag, sample) {
    const foundIndex = this._findBookmark(tag, sample)
    if (foundIndex < 0) return false
    this.getField(tag).remove(foundIndex)
    return true
  }

  removeBookmarkByIndex (tag, index) {
    const bookmark = this.getBookmarkByIndex(tag, index)
    if (bookmark === null) return false
    this.getField(tag).remove(index)
    return true
  }

  getBookmarkByIndex (tag, index) {
    const tagCollection = this.get(tag)
    if (tagCollection === null) return null
    if (index < 0 || index > tagCollection.length - 1) return null
    return tagCollection[index]
  }

  getTagCollection (tag) {
    return (this.hasTagCollection(tag) === true ? this.get(tag) : null)
  }

  hasTagCollection (tag) {
    return this.hasField(tag) && this.get(tag).length > 0
  }

  removeTagCollection (tag) {
    return this.removeField(tag)
  }

  forEach (fn) {
    const fieldsList = this.getFieldsList()
    fieldsList.forEach((key) => {
      fn({ tag: key, collection: this.get(key) })
    })
  }
}

module.exports = {
  BookmarksJsonFile
}
