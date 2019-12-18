class BucketCache {
  constructor () {
    this._array = []
    this._data = new Map()
  }

  _label (label) {
    return 'LB' + label
  }

  getFirst () {
    if (this._data.length === 0) return null
    return this._data[0]
  }

  getLast () {
    if (this._data.length === 0) return null
    return this._data[this._data.length - 1]
  }

  /**
     * Get or set a new object.
     * setFn is the callback called when the object is not set.
     * The callback must return the object which have to be set in the collection.
     * @param label
     * @param {function} setFn
     * @returns {*}
     */
  get (label, setFn) {
    let dt = this._data.get(this._label(label))
    if (_.isNil(dt)) {
      dt = setFn()
      if (!_.isNil(dt)) this._set(label, dt)
    } else {
      dt = dt.data
    }
    return dt
  }

  /**
     * Remove an object.
     * @param label
     * @returns {boolean} true if the object existed and has been removed
     */
  remove (label) {
    const dt = this._data.get(this._label(label))
    if (_.isNil(dt)) return false
    this._array.splice(dt.index, 1)
    return this._data.delete(this._label(label))
  }

  _set (label, data) {
    this.remove(label)
    this._data.set(this._label(label), {
      data: data,
      index: this._array.length
    })
    this._array.push(data)
  }
}

module.exports = BucketCache
