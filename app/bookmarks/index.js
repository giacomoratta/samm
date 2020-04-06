const { BookmarksFile } = require('./bookmarkFile.class')
const { BookmarkSet } = require('./bookmarkSet.class')
const log = require('../logger').createLogger('bookmarks')

const BookmarksFileInstance = new BookmarksFile('file-path-to-do')

const clean = async () => {
  log.info('Cleaning data...')
}

const boot = async () => {
  log.info('Booting...')
}

module.exports = {
  boot,
  clean,

  BookmarksAPI: {
    add: (label, sampleObj) => {
      if (!BookmarksFileInstance.collection.has(label)) {
        const checkResult = label.match(/[a-zA-Z\-\_0-9]+/g)
        if (checkResult === null || checkResult[0] !== label) {
          throw new Error(`Invalid characters for a new bookmark-set label: '${label}'. (Accepted: 0-9,a-z,A-Z,-,_).`)
        }
        if (BookmarksFileInstance.collection.add(label, new BookmarkSet()) !== true) return false
      }
      const sampleSetObj = BookmarksFileInstance.collection.get(label)
      return sampleSetObj.add(sampleObj)
    },

    has: (label) => {
      return BookmarksFileInstance.collection.has(label)
    },

    remove: (label, sampleObj) => {
      if (!BookmarksFileInstance.collection.has(label)) return null
      const sampleSetObj = BookmarksFileInstance.collection.get(label)
      return sampleSetObj.remove(sampleObj)
    },

    removeByIndex: (label, index) => {
      if (!BookmarksFileInstance.collection.has(label)) return null
      const sampleSetObj = BookmarksFileInstance.collection.get(label)
      return sampleSetObj.remove(index)
    },

    get: (label, index) => {
      if (!BookmarksFileInstance.collection.has(label)) return null
      const sampleSetObj = BookmarksFileInstance.collection.get(label)
      return sampleSetObj.get(index)
    },

    labels: () => {
      return BookmarksFileInstance.collection.keys
    },

    getBookmarkSet: (label) => {
      if (BookmarksFileInstance.collection.size === 0) return null
      if (!label) {
        const listObj = {}
        BookmarksFileInstance.collection.forEach((key, sampleSetObj) => {
          listObj[key] = sampleSetObj
        })
      } else {
        if (!BookmarksFileInstance.collection.has(label)) return null
        return BookmarksFileInstance.collection.get(label)
      }
    }
  }
}
