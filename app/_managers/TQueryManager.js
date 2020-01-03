const TQuery = require('./atoms/TQuery.class')

class TQueryManager {
  constructor () {
    this.tqueryObj = null
    this._createTQueryHolder()
  }

  printList (printFn) {
    return this.tqueryObj.forEach(printFn)
  }

  empty () {
    return this.tqueryObj.empty()
  }

  add (tag, query) {
    return this.tqueryObj.add(tag, query)
  }

  remove (tag) {
    return this.tqueryObj.remove(tag)
  }

  get (tag) {
    return this.tqueryObj.get(tag)
  }

  getTags () {
    return this.tqueryObj.getTags()
  }

  save () {
    return dataFileHolder.save('tquery')
  }

  getAsPlainObject () {
    return this.tqueryObj.getAsPlainObject()
  }

  _createTQueryHolder () {
    const _self = this
    return dataFileHolder.setHolder({
      label: 'tquery',
      filePath: configMgr.path('tquery'),
      fileType: 'json',
      dataType: 'object',
      logErrorsFn: d$,
      preLoad: true,

      loadFn: (fileData) => {
        _self.tqueryObj = new TQuery()
        if (!_.isObject(fileData)) {
          return _self.tqueryObj
        }
        _self.tqueryObj.fromJson(fileData)
        return _self.tqueryObj
      },

      saveFn: (tqueryObj) => {
        return tqueryObj.toJson()
      }
    })
  }
}

module.exports = new TQueryManager()