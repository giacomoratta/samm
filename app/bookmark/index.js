const { BookmarksFile } = require('./bookmarkFile.class')
const { BookmarkSet } = require('./bookmarkSet.class')
const log = require('../logger').createLogger('bookmarks')

let BookmarksFileInstance = null

const boot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  try {
    BookmarksFileInstance = new BookmarksFile(filePath)
    const dataPresence = await BookmarksFileInstance.fileHolder.load()
    log.info({ dataPresence }, 'Loaded successfully')
    return true
  } catch (e) {
    log.error(e, 'Cannot load')
    return false
  }
}

const clean = async () => {
  log.info('Cleaning data...')
  if (!BookmarksFileInstance) return
  try {
    BookmarksFileInstance.collection.clean()
    return await BookmarksFileInstance.fileHolder.delete()
  } catch (e) {
    log.error(e, 'Error while cleaning')
    return false
  }
}

const labelRegexp = /[a-zA-Z\-_0-9]+/g
const isLabelValid = (label) => {
  const checkResult = label.match(labelRegexp)
  return !(checkResult === null || checkResult[0] !== label)
}

module.exports = {
  boot,
  clean,

  BookmarkAPI: {

    isLabelValid,

    /**
     * Add a sample to a bookmark-set (create the bookmark-set if not exists).
     * @param {string} label: accepted charset [a-zA-Z\-\_0-9]
     * @param {SampleInfo} sampleObj: n.b. clone before insert
     * @returns {boolean}
     */
    add: (label, sampleObj) => {
      if (!BookmarksFileInstance.collection.has(label)) {
        if (!isLabelValid(label)) {
          throw new Error(`Invalid characters for a new bookmark-set label: '${label}'. (Accepted: 0-9,a-z,A-Z,-,_).`)
        }
        if (BookmarksFileInstance.collection.add(label, new BookmarkSet()) !== true) return false
      }
      const sampleSetObj = BookmarksFileInstance.collection.get(label)
      return sampleSetObj.add(sampleObj) // sampleObj.clone()
    },

    /**
     * Check the existence of a bookmark-set
     * @param {string} label
     * @returns {boolean}
     */
    has: (label) => {
      return BookmarksFileInstance.collection.has(label)
    },

    /**
     * Get all the bookmark-set labels
     * @returns {[<string>]}
     */
    labels: () => {
      return BookmarksFileInstance.collection.keys
    },

    /**
     * Remove a sample by index or by itself
     * @param {string} label
     * @param {SampleInfo|number} sample
     * @returns {SampleInfo|null}
     */
    remove: (label, sample) => {
      if (!BookmarksFileInstance.collection.has(label)) return null
      const sampleSetObj = BookmarksFileInstance.collection.get(label)
      return sampleSetObj.remove(sample)
    },

    /**
     * Get a single sample, one bookmark-set or the bookmark-set list:
     *  -> label    + index    = single sample
     *  -> label    + no-index = bookmark-set
     *  -> no-label + no-index = bookmark-set list
     * @param {string} [label]
     * @param {number} [index]
     * @returns {SampleInfo|BookmarkSet|null}
     */
    get: (label, index) => {
      if (BookmarksFileInstance.collection.size === 0) return null
      if (typeof label === 'string') {
        if (!BookmarksFileInstance.collection.has(label)) return null
        const sampleSetObj = BookmarksFileInstance.collection.get(label)

        if (typeof index === 'number') {
          return sampleSetObj.get(index) || null
        }
        return sampleSetObj || null
      }
      const listObj = {}
      BookmarksFileInstance.collection.forEach((key, sampleSetObj) => {
        listObj[key] = sampleSetObj
      })
      return listObj
    }
  }
}
