class JsonArrayType {
  constructor ({ orderType = 'ASC', itemsClass }) {
    this._collection = []
    orderType = ['ASC', 'DESC'].indexOf(orderType) === -1 ? 'ASC' : orderType
    this._itemsClass = itemsClass

    /**
     * ASC = insert on top, delete from bottom
     * DESC = insert on bottom, delete from top
     */
    this._isTop = (orderType === 'ASC')
  }

  get length () {
    return this._collection.length
  }

  clean () {
    this._collection = []
  }

  get (index) {
    return this._collection[index]
  }

  has (index) {
    return (this._collection[index] !== undefined)
  }

  add (index, obj) {
    if (!obj) { /* support 1 only argument */
      obj = index
      index = -1
    }

    if (!(obj instanceof this._itemsClass)) {
      throw new TypeError('obj should be an instance of ' + this._itemsClass.name + ' class')
    }
    if (obj.isValid() !== true) return false

    if (index >= 0 && index < this._collection.length) {
      this._collection.splice(index, 0, obj)
      return true
    }
    if (this._isTop === true) {
      this._collection.unshift(obj)
    } else {
      this._collection.push(obj)
    }
    return true
  }

  remove (index) {
    if (index >= 0 && index < this._collection.length) {
      this._collection.splice(index, 1)
      return true
    }
    if (this._isTop === true) {
      this._collection.pop()
    } else {
      this._collection.shift()
    }
    return true
  }

  forEach (fn) {
    this._collection.forEach((item, index) => {
      fn(index, item)
    })
  }
}

module.exports = { JsonArrayType }
