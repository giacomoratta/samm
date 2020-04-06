/**
 * index should return a sampleSet
 * sampleSet allows to perform filtering and subselection
 * not aware about PathBasedQuery (index should be!)
 *
 * sampleSet is a generic sampleInfo set with no duplicates
 * should offer fromJson and toJson
 */

const { SampleInfo } = require('./sampleInfo.class')

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max) // not included
  return Math.floor(Math.random() * (max - min)) + min
}

class SampleSet {
  constructor ({ validateFn } = {}) {
    this.validateFn = validateFn

    /**
     * List of SampleInfo objects
     * @type {[<SampleInfo>]}
     */
    this.array = []
  }

  get size () {
    return this.array.length
  }

  forEach (callback) {
    this.array.forEach(callback)
  }

  /**
   * Create a new SampleObject.
   * @param {string} absolutePath
   * @param {string} [relRootPath]
   * @returns {Promise<SampleInfo>}
   */
  static async create ({ absolutePath, relRootPath }) {
    const sampleInfoObj = new SampleInfo()
    await sampleInfoObj.set({ absolutePath, relRootPath })
    return sampleInfoObj
  }

  /**
   * Add a SampleInfo object to the set.
   * @param {SampleInfo} sample
   * @returns {boolean}
   */
  add (sample) {
    if (!(sample instanceof SampleInfo)) {
      throw new Error('The sample object must be an instance of SampleInfo!')
    }
    if (this.validateFn && this.validateFn(sample) === false) return false
    this.array.push(sample)
    return true
  }

  /**
   * Remove a sample by index or by match.
   * @param {SampleInfo|number} sample
   * @returns {SampleInfo|null}
   */
  remove (sample) {
    let sampleIndex = -1
    if (sample instanceof SampleInfo) {
      sampleIndex = this.array.findIndex(item => item.isEqualTo(sample))
    } else if (typeof sample !== 'number') {
      throw new Error('The sample object must be an integer or an SampleInfo instance.')
    } else {
      sampleIndex = sample
    }
    if (sampleIndex < 0 || this.array.length === 0 || this.array.length - 1 < sampleIndex) return null
    return this.array.splice(sampleIndex, 1)[0]
  }

  /**
   * Get a random subset of SampleInfo objects
   * @param {number} max
   * @param {number} maxFromSameDirectory
   * @returns {SampleSet}
   */
  random ({ max = 10, maxFromSameDirectory = 0 }) {
    const randomSampleSet = new SampleSet({
      validateFn: this.validateFn
    })
    const collectionSize = this.array.length
    max = Math.min(max, collectionSize)

    const addedIndexes = []
    const addedDirectories = {}

    for (let randomIndex, retry = 10, i = 0; randomSampleSet.size < max; i++) {
      if (i === collectionSize) {
        if (randomSampleSet.size < max && retry > 0) {
          i = -1
          retry--
          continue
        } else {
          break
        }
      }

      randomIndex = getRandomInt(0, collectionSize)
      if (addedIndexes.indexOf(randomIndex) >= 0) continue
      addedIndexes.push(randomIndex)

      if (maxFromSameDirectory > 0) {
        if (!addedDirectories[this.array[randomIndex].dir]) addedDirectories[this.array[randomIndex].dir] = 0
        if (addedDirectories[this.array[randomIndex].dir] === maxFromSameDirectory) continue
        addedDirectories[this.array[randomIndex].dir]++
      }

      randomSampleSet.add(this.array[randomIndex])
    }

    return randomSampleSet
  }

  toJson () {
    const jsonData = this.array.map(sample => sample.toJson())
    return jsonData || []
  }

  fromJson (jsonData, SampleInfoClass) {
    if (!SampleInfoClass) SampleInfoClass = SampleInfo
    this.array = jsonData.map(jsonItem => {
      const sample = new SampleInfoClass()
      sample.fromJson(jsonItem)
      return sample
    })
  }
}

module.exports = {
  SampleSet
}
