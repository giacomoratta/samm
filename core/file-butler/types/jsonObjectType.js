
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

  get length () {
    return this._keys.length
  }

  clean () {
    this._collection = {}
    this._keys = []
  }

  get (key) {
    return this._collection[key]
  }

  has (key) {
    return (this._collection[key] !== undefined)
  }

  add (key, obj) {
    if (!(obj instanceof this._itemsClass)) {
      throw new TypeError('obj should be an instance of ' + this._itemsClass.className + ' class')
    }
    if (obj.isValid() !== true) return false

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
}

module.exports = { JsonObjectType }
