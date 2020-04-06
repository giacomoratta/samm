const { SampleSet } = require('../sample/sampleSet.class')

class BookmarkSet extends SampleSet {
  isValid () {
    return true
  }

  isEqualTo () {
    return false
  }
}

module.exports = {
  BookmarkSet
}
