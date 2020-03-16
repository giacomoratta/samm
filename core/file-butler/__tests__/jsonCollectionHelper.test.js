const { JsonCollectionFile } = require('../jsonCollectionFile.class')

class TestCollectionObject {
  constructor (testData) {
    if (!testData) return
    this.label = testData.label
    this.queryString = testData.queryString
  }

  isValid () {
    return this.queryString !== 'bad-value'
  }

  fromJson (jsonData) {
    this.label = jsonData.label
    this.queryString = jsonData.queryString
  }

  toJson () {
    return {
      label: this.label,
      queryString: this.queryString
    }
  }
}

class TestCollectionFile extends JsonCollectionFile {
  constructor (filePath, testOptions) {
    super({
      filePath,
      itemsClass: TestCollectionObject,
      ...testOptions
    })
  }
}

function bulkInsertObjectType (TFObj) {
  TFObj.collection.clean()
  TFObj.fileHolder.data = null
  const pbq1 = new TestCollectionObject({
    label: 'my_label_11',
    queryString: 'bad-value'
  })
  expect(TFObj.collection.add('my_label_11', pbq1)).toEqual(false)
  expect(TFObj.collection.get('my_label_11')).toEqual(undefined)
  expect(TFObj.collection.has('my_label_11')).toEqual(false)

  const pbq2 = new TestCollectionObject({
    label: 'my_label_11',
    queryString: 'good-value1'
  })
  expect(TFObj.collection.add('my_label_11', pbq2)).toEqual(true)
  expect(TFObj.collection.get('my_label_11')).not.toEqual(undefined)
  expect(TFObj.collection.has('my_label_11')).toEqual(true)

  const pbq3 = new TestCollectionObject({
    label: 'my_label_21',
    queryString: 'good-value2'
  })
  expect(TFObj.collection.add('my_label_21', pbq3)).toEqual(true)

  const pbq4 = new TestCollectionObject({
    label: 'my_label_31',
    queryString: 'good-value3'
  })
  expect(TFObj.collection.add('my_label_31', pbq4)).toEqual(true)

  const pbq5 = new TestCollectionObject({
    label: 'my_label_41',
    queryString: 'good-value4'
  })
  expect(TFObj.collection.add('my_label_41', pbq5)).toEqual(true)
}

function bulkInsertArrayType (TFObj) {
  TFObj.collection.clean()
  TFObj.fileHolder.data = null
  const pbq1 = new TestCollectionObject({
    label: 'my_label_11',
    queryString: 'bad-value'
  })
  expect(TFObj.collection.add(pbq1)).toEqual(false)
  expect(TFObj.collection.get()).toEqual(undefined)
  expect(TFObj.collection.has(0)).toEqual(false)

  const pbq2 = new TestCollectionObject({
    label: 'my_label_11',
    queryString: 'good-value1'
  })
  expect(TFObj.collection.add(pbq2)).toEqual(true)
  expect(TFObj.collection.get(0)).not.toEqual(undefined)
  expect(TFObj.collection.latest.label).toEqual(TFObj.collection.oldest.label)
  expect(TFObj.collection.has(0)).toEqual(true)

  const pbq3 = new TestCollectionObject({
    label: 'my_label_21',
    queryString: 'good-value2'
  })
  expect(TFObj.collection.add(pbq3)).toEqual(true)

  const pbq4 = new TestCollectionObject({
    label: 'my_label_31',
    queryString: 'good-value3'
  })
  expect(TFObj.collection.add(pbq4)).toEqual(true)

  const pbq5 = new TestCollectionObject({
    label: 'my_label_41',
    queryString: 'good-value4'
  })
  expect(TFObj.collection.add(pbq5)).toEqual(true)
}

module.exports = {
  TestCollectionObject,
  TestCollectionFile,
  bulkInsertObjectType,
  bulkInsertArrayType
}
