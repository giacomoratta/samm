const autoLabel = function (index) {
  return `_item_${index}`
}

class SpheroidCache {
  constructor ({ maxItems = 10 }) {
    this._itemCounter = 0
    this.array = []
    this.map = new Map()
    this.maxItems = maxItems
  }

  get size () {
    return this.array.length
  }

  get first () {
    if (this.size === 0) return
    return this.array[0].value
  }

  get last () {
    if (this.size === 0) return
    return this.array[this.size - 1].value
  }

  add (label, value) {
    if (value === undefined) {
      value = label
      label = autoLabel(++this._itemCounter)
    }
    if (this.map.has(label)) {
      throw new Error(`Duplicated label: ${label}`)
    }
    if (this.size === this.maxItems) this.remove()
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
}

module.exports = SpheroidCache
