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
  constructor ({ validateFn, itemsClass } = {}) {
    this.validateFn = validateFn

    this.itemsClass = itemsClass || SampleInfo

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
   * @param {T} [ItemsClass]
   * @returns {Promise<SampleInfo|T>}
   */
  static async create ({ absolutePath, relRootPath, ItemsClass = SampleInfo }) {
    const sampleInfoObj = new ItemsClass()
    await sampleInfoObj.set({ absolutePath, relRootPath })
    return sampleInfoObj
  }

  /**
   * Get sample by index
   * @param {number} index
   * @returns {SampleInfo}
   */
  get (index) {
    return this.array[index]
  }

  /**
   * Find sample
   * @param {SampleInfo} sample
   * @returns {number}
   */
  find (sample) {
    return this.array.findIndex(item => item.isEqualTo(sample))
  }

  /**
   * Add a SampleInfo object to the set.
   * @param {SampleInfo} sample
   * @returns {boolean}
   * @todo: as 'set' it should avoid duplicates
   */
  add (sample) {
    if (!(sample instanceof this.itemsClass)) {
      throw new Error(`The sample object must be an instance of ${this.itemsClass.name}`)
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
    if (sample instanceof this.itemsClass) {
      sampleIndex = this.array.findIndex(item => item.isEqualTo(sample))
    } else if (typeof sample !== 'number') {
      throw new Error(`The sample object must be an integer or instance of ${this.itemsClass.name}.`)
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

    /* set too small */
    if (this.size <= max) {
      this.array.forEach((sample) => {
        randomSampleSet.array.push(sample)
      })
      return randomSampleSet
    }

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

      randomSampleSet.array.push(this.array[randomIndex])
    }

    return randomSampleSet
  }

  toJson () {
    const jsonData = this.array.map(sample => sample.toJson())
    return jsonData || []
  }

  fromJson (jsonData) {
    const ItemsClass = this.itemsClass
    this.array = jsonData.map(jsonItem => {
      const sample = new ItemsClass()
      sample.fromJson(jsonItem)
      return sample
    })
  }

  isValid () {
    // todo
    // compatibility with JsonCollectionFile accepted objects
    return true
  }

  isEqualTo () {
    // todo
    // compatibility with JsonCollectionFile accepted objects
    return false
  }
}

module.exports = {
  SampleSet
}
