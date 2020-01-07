const _ = require('lodash')
const { SampleInfo } = require('./sampleInfo.class')

class SampleSet {
  constructor ({ validate } = {}) {
    this.validate = validate
    this.table = { }
    this.array = []
  }

  get size () {
    return this.array.length
  }

  forEach (callback) {
    this.array.forEach(callback)
  }

  add (sample) {
    if (!(sample instanceof SampleInfo)) {
      throw new Error('The sample object must be an instance of SampleInfo!')
    }
    if (this.validate && this.validate(sample) === false) return false
    if (!this.table[sample.name]) this.table[sample.name] = []
    this.table[sample.name].push(sample)
    this.array.push(sample)
    return true
  }

  remove (sample) {
    if (!(sample instanceof SampleInfo)) {
      throw new Error('The sample object must be an instance of SampleInfo!')
    }
    let removedSamples = 0
    if (!this.table[sample.name]) return removedSamples
    for (let i = this.table[sample.name].length - 1; i >= 0; i--) {
      if (!this.table[sample.name][i].isEqualTo(sample)) continue
      this.table[sample.name].splice(i, 1)
      removedSamples++
    }
    for (let i = this.array.length - 1; i >= 0; i--) {
      if (!this.array[i].isEqualTo(sample)) continue
      this.array.splice(i, 1)
      removedSamples++
    }
    if (removedSamples % 2 !== 0) {
      throw new Error('Discrepancy in sample set internal collections!')
    }
    return removedSamples
  }

  /**
   * Get a random subset of SampleInfo objects
   * @param max
   * @param maxFromSameDirectory
   * @returns {[<SampleInfo>]}
   */
  random ({ max = 10, maxFromSameDirectory = 0 }) {
    const randomArray = []
    const collectionSize = this.array.length
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
        if (!addedDirectories[this.array[randomIndex].dir]) addedDirectories[this.array[randomIndex].dir] = 0
        if (addedDirectories[this.array[randomIndex].dir] === maxFromSameDirectory) continue
        addedDirectories[this.array[randomIndex].dir]++
      }

      randomArray.push(this.array[randomIndex])
    }

    return randomArray
  }
}

module.exports = {
  SampleSet
}
