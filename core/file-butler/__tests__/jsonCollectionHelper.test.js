const { JsonCollectionFile } = require('../jsonCollectionFile.class')

class TestCollectionObject {
  constructor (testData) {
    this.attr1 = 'test123'
    this.label = testData.label
    this.queryString = testData.queryString
  }

  isValid () {
    return this.queryString !== 'bad-value'
  }

  fromJson (jsonData) {
    this.attr1 = 'test123'
    this.label = jsonData.label
    this.queryString = jsonData.queryString
  }

  toJson () {
    return {
      attr1: this.attr1,
      label: this.label,
      queryString: this.queryString
    }
  }
}

class TestCollectionFile extends JsonCollectionFile {
  constructor (filePath, testOptions) {
    super({
      filePath,
      objectClass: TestCollectionObject,
      ...testOptions
    })
  }
}

module.exports = { TestCollectionObject, TestCollectionFile }
