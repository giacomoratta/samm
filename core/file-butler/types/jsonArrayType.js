class JsonArrayType {
  constructor ({ orderType = 'ASC', itemsClass, collectionMaxSize }) {
    this._collection = []
    orderType = ['ASC', 'DESC'].indexOf(orderType) === -1 ? 'ASC' : orderType
    this._itemsClass = itemsClass
    this._maxSize = (!collectionMaxSize ? 0 : collectionMaxSize)

    /**
     * ASC = insert on top, delete from bottom
     * DESC = insert on bottom, delete from top
     */
    this._isTop = (orderType === 'ASC')
  }

  get size () {
    return this._collection.length
  }

  clean () {
    this._collection = []
  }

  get (index) {
    return this._collection[index]
  }

  get latest () {
    if (this._isTop !== true) {
      return this._collection[0]
    } else {
      return this._collection[this.size - 1]
    }
  }

  get oldest () {
    if (this._isTop !== true) {
      return this._collection[this.size - 1]
    } else {
      return this._collection[0]
    }
  }

  has (index) {
    return (this._collection[index] !== undefined)
  }

  find (obj) {
    return this._collection.findIndex((element/*, index, array */) => {
      return obj.isEqualTo(element)
    })
  }

  add (index, obj) {
    if (!obj) { /* support 1 only argument */
      obj = index
      index = -1
    }

    if (!(obj instanceof this._itemsClass)) {
      throw new TypeError('the object should be an instance of ' + this._itemsClass.name + ' class')
    }
    if (obj.isValid() !== true) return false

    /* remove duplicate first */
    const foundIndex = this.find(obj)
    if (foundIndex >= 0) this.remove(foundIndex)

    if (index >= 0 && index < this.size) {
      this._collection.splice(index, 0, obj)
      if (this._maxSize && this.size > this._maxSize) this.remove()
      return true
    }
    if (this._isTop !== true) {
      this._collection.unshift(obj)
    } else {
      this._collection.push(obj)
    }
    if (this._maxSize && this.size > this._maxSize) this.remove()
    return true
  }

  remove (index) {
    if (index !== null || index !== undefined) {
      if (index >= 0 && index < this.size) {
        this._collection.splice(index, 1)
        return true
      }
      return false
    }
    if (this._isTop !== true) {
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

  fromJson (data) {
    this.clean()
    const ItemsClass = this._itemsClass
    data.reverse()
    data.forEach((item) => {
      const obj = new ItemsClass()
      obj.fromJson(item)
      this.add(obj)
    })
  }

  toJson () {
    const data = []
    this.forEach((index, item) => {
      data.push(item.toJson())
    })
    if (this._isTop === true) data.reverse()
    return data
  }
}

module.exports = { JsonArrayType }
