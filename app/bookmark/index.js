const { BookmarksFile } = require('./bookmarkFile.class')
const { SampleSet: BookmarkSet } = require('../sample/sampleSet.class')
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

  /**
   * N.B. This API will not perform save and load operations implicitly because it might be involved in many
   *      different operations before a real need of updating the file.
   */
  BookmarkAPI: {

    /**
     * Utility to check a label format before any operation.
     * @returns {boolean}
     */
    isLabelValid,

    /**
     * Check if there is at least a bookmark-set.
     * @returns {boolean}
     */
    hasBookmarks () {
      return BookmarksFileInstance.collection.size > 0
    },

    /**
     * Get the number of bookmark sets present
     * @returns {number}
     */
    totalSets () {
      return BookmarksFileInstance.collection.size
    },

    /**
     * Get the total number of bookmarked samples present
     * @returns {number}
     */
    totalSamples () {
      if (BookmarksFileInstance.collection.size === 0) return 0
      let total = 0
      BookmarksFileInstance.collection.forEach((bookmarkSet) => {
        total += bookmarkSet.size
      })
      return total
    },

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
    },

    /**
     * Duplicate a set or merge into an existing one.
     * @param {string} sourceLabel
     * @param {string} destLabel
     * @returns {boolean}
     */
    copySet: (sourceLabel, destLabel) => {
      const BF = BookmarksFileInstance
      if (!BF.collection.has(sourceLabel)) return false
      const sourceSet = BF.collection.get(sourceLabel)
      if (sourceSet.size === 0) return false
      const destSet = BF.collection.get(destLabel) || new BookmarkSet()
      sourceSet.forEach((bookmark) => {
        // todo: avoid duplicates?
        destSet.add(bookmark.clone())
      })
      return BF.collection.add(sourceLabel, destSet)
    },

    /**
     * Rename a bookmark set.
     * @param {string} oldLabel
     * @param {string} newLabel
     * @returns {boolean}
     */
    renameSet: (oldLabel, newLabel) => {
      const BF = BookmarksFileInstance
      if (!BF.collection.has(oldLabel)) return false
      if (BF.collection.has(newLabel)) return false
      const sourceSet = BF.collection.get(oldLabel)
      BF.collection.add(newLabel, sourceSet)
      return BF.collection.remove(oldLabel)
    },

    update: async () => {
      const dataPresence = await BookmarksFileInstance.save()
      log.info({ dataPresence }, 'Bookmark file updated.')
    }
  }
}
