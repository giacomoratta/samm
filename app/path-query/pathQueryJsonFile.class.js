const { JsonizedFile } = require('../../core/jsonized-file')
const { PathBasedQuery } = require('./pathBasedQuery.class')

class PathQueryJsonFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true, sortedFields: true })

    // create fields dynamically
    this.beforeLoadFn = (data) => {
      Object.keys(data).forEach((key) => {
        this.removeField(key)
        this.add({ jsonData: data[key] })
      })
      return data
    }

    this.collection = {}
  }

  add ({ pathBasedQueryObject, jsonData }) {
    if (!pathBasedQueryObject) {
      pathBasedQueryObject = new PathBasedQuery()
      if (pathBasedQueryObject.fromJson(jsonData) !== true) return false
    } else if (!(pathBasedQueryObject instanceof PathBasedQuery)) {
      throw new TypeError('pathBasedQueryObject should be an instance of PathBasedQuery class')
    }

    this.addField({
      name: pathBasedQueryObject.label,
      schema: {
        type: 'object',
        props: {
          label: { type: 'string' },
          functionBody: { type: 'string' },
          queryString: { type: 'string' }
        }
      },
      value: pathBasedQueryObject.toJson()
    })

    this.collection[pathBasedQueryObject.label] = pathBasedQueryObject
    return true
  }

  get (label) {
    return this.collection[label]
  }

  remove (label) {
    if (this.removeField(label) === true) {
      delete this.collection[label]
      return true
    }
    return false
  }

  has (label) {
    return this.hasField(label)
  }

  size () {
    return this.getFieldsCount()
  }

  forEach (fn) {
    const fieldsList = this.getFieldsList()
    fieldsList.forEach((key) => {
      fn(this.collection[key])
    })
  }
}

module.exports = {
  PathQueryJsonFile
}
