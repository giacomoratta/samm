class SpheroidList {
  constructor ({ maxSize = 10 }) {
    this._maxSize = maxSize
    if (maxSize < 1) {
      throw new TypeError('maxSize cannot be less than 1')
    }
    if (typeof maxSize !== 'number' || !Number.isInteger(maxSize)) {
      throw new TypeError('maxSize must be an integer')
    }
    this.reset()
  }

  static autoLabel (index) {
    return `_item_${index}`
  }

  reset () {
    this._itemCounter = 0
    this.array = []
    this.map = new Map()
  }

  get size () {
    return this.array.length
  }

  get maxSize () {
    return this._maxSize
  }

  get latest () {
    if (this.size === 0) return
    return this.array[0].value
  }

  get oldest () {
    if (this.size === 0) return
    return this.array[this.size - 1].value
  }

  add (label, value) {
    if (value === undefined) {
      value = label
      label = SpheroidList.autoLabel(++this._itemCounter)
    }
    if (this.map.has(label)) {
      throw new Error(`Duplicated label: ${label}`)
    }
    if (this.size === this.maxSize) this.remove()
    this.array.unshift({ label, value })
    this.map.set(label, value)
    return true
  }

  remove (label) {
    if (this.size === 0) return false
    if (label) {
      if (!this.map.has(label)) return false
      let foundIndex = -1
      this.array.some((item, index) => {
        if (item.label === label) {
          foundIndex = index
          return true
        }
        return false
      })
      this.array.splice(foundIndex, 1)
      this.map.delete(label)
      return true
    }
    const lastItem = this.array[this.size - 1]
    this.map.delete(lastItem.label)
    this.array.pop()
    return true
  }

  get (label) {
    if (typeof label === 'number') {
      if (this.size - 1 < label) return
      if (label < 0) return
      return this.array[label].value
    }
    return this.map.get(label)
  }

  has (label) {
    if (typeof label === 'number') {
      return (this.array[label] !== undefined || this.array[label] !== null)
    }
    return this.map.has(label)
  }

  forEach (fn) {
    this.array.forEach(fn) // fn({ label, value })
  }
}

module.exports = {
  SpheroidList
}
