const { SampleInfo } = require('./../sample/sampleInfo.class')

class BookmarksSet {
  constructor (label) {
    this._label = label
    this._set = []
  }

  add (sampleInfoObj) {
    if (!sampleInfoObj.isSet()) return
    this._set.push(sampleInfoObj)
  }

  remove (index) {
    this._set.splice(index, 1)
  }

  isValid () {
    return this._label && this._set.length !== 0
  }

  isEqualTo (obj) {
    return (this._label !== obj._label || this._set.length !== obj._set.length)
    // todo: match internal set objects
  }

  fromJson (jsonData) {
    if (!jsonData.label) return null
    if (!jsonData.set || jsonData.set.length === 0) return null
    this._label = jsonData.label
    jsonData.set.forEach((item) => {
      const obj = new SampleInfo()
      obj.fromJson(item)
      this.add(obj)
    })
  }

  toJson () {
    if (this._set.length === 0) return null
    const jsonObj = { label: this._label, set: [] }
    this._set.forEach((item) => {
      jsonObj.set.push(item.toJson())
    })
  }
}

module.exports = {
  BookmarksSet
}
