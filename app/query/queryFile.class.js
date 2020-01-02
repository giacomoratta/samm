const { Config } = require('../config')
const { JsonizedFile } = require('../../core/jsonized-file')
const utils = require('./utils')

class QueryJsonFile {
  constructor (filePath) {
    this.QueryCollectionTemp = {}

    this.jsonFile = new JsonizedFile({ filePath, prettyJson: true })
    this.jsonFile.addField({
      name: 'QueryCollection',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          props: {
            label: { type: "string" },
            functionBody: { type: "string" },
            queryString: { type: "string" }
          }
        },
        default: [
          {
            label:'asd1',
            functionBody:'asd2',
            queryString:'asd3'
          }
        ]
      }
    })
  }

  save() {
    const queryCollectionKeys = Object.keys(this.QueryCollectionTemp)
    if(queryCollectionKeys.length === 0) return false
    const queryCollection = []
    queryCollectionKeys.forEach((k) => {
      queryCollection.push({
        label: this.QueryCollectionTemp[k].label,
        functionBody: this.QueryCollectionTemp[k].functionBody,
        queryString: this.QueryCollectionTemp[k].queryString
      })
    })
    this.jsonFile.set('QueryCollection',queryCollection)
    return this.jsonFile.save()
  }

  load() {
    this.jsonFile.load()
    const queryCollection = this.jsonFile.get('QueryCollection')
    if(!(queryCollection instanceof Array) || queryCollection.length === 0) return
    queryCollection.forEach((item) => {
      item.check = utils.createQueryStringCheck(item.functionBody)
      this.QueryCollectionTemp[item.label] = item
    })
  }

  get(label) {
    return this.QueryCollectionTemp[label]
  }

  remove(label) {
    delete this.QueryCollectionTemp[label]
  }

  add({ label, queryString }) {
    const queryInfo = utils.processQueryString(queryString)
    if(!queryInfo) return false
    queryInfo.label = label
    this.QueryCollectionTemp[label] = queryInfo
  }

  forEach(fn) {
    const queryCollectionKeys = Object.keys(this.QueryCollectionTemp)
    if(queryCollectionKeys.length > 0) {
      const queryCollection = []
      queryCollectionKeys.forEach((k) => {
        fn({ label:this.QueryCollectionTemp[k].label, queryString:this.QueryCollectionTemp[k].queryString })
      })
      return true
    }
    return false
  }

}

const QueryFile = new QueryJsonFile(Config.get('QueryFile'))
QueryFile.load()

module.exports = {
  QueryFile
}
