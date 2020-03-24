
function _orderByASC (a, b) {
  a = a.toLowerCase()
  b = b.toLowerCase()
  return a.localeCompare(b)
}

function _orderByDESC (a, b) {
  a = a.toLowerCase()
  b = b.toLowerCase()
  return b.localeCompare(a)
}

class JsonObjectType {
  constructor ({ orderType = 'ASC', itemsClass }) {
    this._collection = {}
    this._keys = []
    orderType = ['ASC', 'DESC'].indexOf(orderType) === -1 ? 'ASC' : orderType
    this._isASC = (orderType === 'ASC')
    this._itemsClass = itemsClass
  }

  get size () {
    return this._keys.length
  }

  clean () {
    this._collection = {}
    this._keys = []
  }

  get (key) {
    return this._collection[key]
  }

  getByIndex (index) {
    if (!this._keys[index]) return
    return this._collection[this._keys[index]]
  }

  has (key) {
    return (this._collection[key] !== undefined)
  }

  find (obj) {
    const keyIndex = this._keys.findIndex((key/*, index, array */) => {
      return obj.isEqualTo(this._collection[key])
    })
    if (keyIndex >= 0) return this._keys[keyIndex]
    return null
  }

  add (key, obj) {
    if (!(obj instanceof this._itemsClass)) {
      throw new TypeError('the object should be an instance of ' + this._itemsClass.name + ' class')
    }
    if (obj.isValid() !== true) return false

    /* remove duplicate first */
    const foundKey = this.find(obj)
    if (foundKey) this.remove(foundKey)

    if (!this._collection[key]) {
      this._keys.push(key)
      this._keys.sort(this._isASC === true ? _orderByASC : _orderByDESC)
    }
    this._collection[key] = obj
    return true
  }

  remove (key) {
    if (!this._collection[key]) return
    const index = this._keys.indexOf(key)
    if (index >= 0) {
      this._keys.splice(index, 1)
    }
    delete this._collection[key]
    return true
  }

  forEach (fn) {
    this._keys.forEach((key) => {
      fn(key, this._collection[key])
    })
  }

  fromJson (data) {
    this.clean()
    const ItemsClass = this._itemsClass
    Object.keys(data).forEach((key) => {
      const obj = new ItemsClass()
      obj.fromJson(data[key])
      this.add(key, obj)
    })
  }

  toJson () {
    const data = {}
    this.forEach((key, obj) => {
      data[key] = obj.toJson()
    })
    return data
  }
}

module.exports = { JsonObjectType }
