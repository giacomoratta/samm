const { JsonizedFile } = require('../../core/jsonized-file')
const { PathBasedQuery } = require('./pathBasedQuery.class')

class PathQueryJsonFile /* todo: extends JsonizedFile */ {
  constructor (filePath) {
    // todo: check bookmarks
    // todo: read/write ordered list of queries

    this.QueryCollectionTemp = {}

    this.jsonFile = new JsonizedFile({ filePath, prettyJson: true })
    this.jsonFile.addField({
      name: 'QueryCollection',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          props: {
            label: { type: 'string' },
            functionBody: { type: 'string' },
            queryString: { type: 'string' }
          }
        },
        default: [
          {
            label: 'query_label',
            functionBody: 'if(...) return true; return false;',
            queryString: 'abc+def,ghj,qwerty'
          }
        ]
      }
    })
  }

  deleteFile () {
    return this.jsonFile.deleteFile()
  }

  save () {
    const queryCollectionKeys = Object.keys(this.QueryCollectionTemp)
    const queryCollection = []
    if (queryCollectionKeys.length > 0) {
      queryCollectionKeys.forEach((k) => {
        queryCollection.push(this.QueryCollectionTemp[k].toJson())
      })
    }
    this.jsonFile.set('QueryCollection', queryCollection)
    return this.jsonFile.save()
  }

  load () {
    if (this.jsonFile.load() !== true) return false
    this.QueryCollectionTemp = {}
    const queryCollection = this.jsonFile.get('QueryCollection')
    if (!(queryCollection instanceof Array) || queryCollection.length === 0) return false
    queryCollection.forEach((item) => {
      this.QueryCollectionTemp[item.label] = new PathBasedQuery()
      this.QueryCollectionTemp[item.label].fromJson(item)
    })
    return true
  }

  has (label) {
    return this.QueryCollectionTemp[label] !== undefined
  }

  get (label) {
    return this.QueryCollectionTemp[label]
  }

  remove (label) {
    delete this.QueryCollectionTemp[label]
  }

  add ({ label, queryString }) {
    const newPathBasedQuery = new PathBasedQuery(queryString)
    if (!newPathBasedQuery.label) return false
    newPathBasedQuery.label = label
    this.QueryCollectionTemp[label] = newPathBasedQuery
    return true
  }

  forEach (callback) {
    const queryCollectionKeys = Object.keys(this.QueryCollectionTemp)
    if (queryCollectionKeys.length > 0) {
      queryCollectionKeys.forEach((k) => {
        callback(this.QueryCollectionTemp[k])
      })
      return true
    }
    return false
  }
}

module.exports = {
  PathQueryJsonFile
}
