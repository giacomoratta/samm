const _ = require('lodash')
const { SampleInfo } = require('./sampleInfo.class')

/*
 * create SampleInfo class
 * use in forEach for fn({ sampleInfo, index })
 * throw errors in add or remove
 *
 * this.array attribute
 * add to table and array
 * add = O(1)
 * remove = O(n)
 * toArray = O(1) and can be removed
 * forEach will be less complex
 *
 * manage array with empty fields? no, because it is only for remove and remove is not so usual
 *
 */

class SampleSet {
  constructor ({ validate } = {}) {
    this.validate = validate
    this.table = { }
    this._size = 0
  }

  add (sample) {
    if (this.validate && this.validate(sample) === false) return false
    if (!this.table[sample.name]) this.table[sample.name] = []
    this.table[sample.name].push(sample)
    this._size++
    return true
  }

  remove (sample) {
    let removedSamples = 0
    if (!this.table[sample.name]) return removedSamples
    for (let i = this.table[sample.name].length - 1; i >= 0; i--) {
      if (!this.table[sample.name][i].isEqualTo(sample)) continue
      this.table[sample.name].splice(i, 1)
      removedSamples++
    }
    this._size -= removedSamples
    return removedSamples
  }

  get size () {
    return this._size
  }

  // toArray () {
  //   const newArray = []
  //   this.forEach((sample) => {
  //     newArray.push(sample.toJson())
  //   })
  //   return newArray
  // }

  forEach (fn) {
    let index = 0
    Object.keys(this.table).forEach((k) => {
      this.table[k].forEach((sample) => {
        fn(sample, index)
        index++
      })
    })
  }

  /**
   * Get a random subset of SampleInfo objects
   * @param max
   * @param maxFromSameDirectory
   * @returns {[<SampleInfo>]}
   */
  random ({ max = 10, maxFromSameDirectory = 0 }) {
    const randomArray = []
    const collection = this.toArray()
    const collectionSize = collection.length
    max = Math.min(max, collectionSize)

    const addedIndexes = []
    const addedDirectories = {}

    for (let randomIndex, retry = 10, i = 0; randomArray.length < max; i++) {
      if (i === collectionSize) {
        if (randomArray.length < max && retry > 0) {
          i = -1
          retry--
          continue
        } else {
          break
        }
      }

      randomIndex = (_.random(0, collectionSize) % collectionSize)
      if (addedIndexes.indexOf(randomIndex) >= 0) continue
      addedIndexes.push(randomIndex)

      if (maxFromSameDirectory > 0) {
        if (!addedDirectories[collection[randomIndex].dir]) addedDirectories[collection[randomIndex].dir] = 0
        if (addedDirectories[collection[randomIndex].dir] === maxFromSameDirectory) continue
        addedDirectories[collection[randomIndex].dir]++
      }

      randomArray.push(collection[randomIndex])
    }

    return randomArray
  }
}

module.exports = {
  SampleSet
}
