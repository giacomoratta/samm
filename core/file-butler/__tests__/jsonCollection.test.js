const path = require('path')
const testObjLocation = path.join(__dirname, 'dir_test', 'test_collection.json')

const { JsonCollectionFile } = require('../jsonCollection.class')

class TestCollectionObject {
  constructor (testData) {
    this.attr1 = 'test123'
    this.label = testData.label
    this.queryString = testData.queryString
  }
}

class TestCollectionFile extends JsonCollectionFile {
  fromJson (jsonData) {
    const obj = new TestCollectionObject(jsonData)
    return obj
  }

  toJson (obj) {
    return {
      attr1: obj.attr1,
      label: obj.label,
      queryString: obj.queryString
    }
  }

  add (label, dataObject) {
    if (!(dataObject instanceof TestCollectionObject)) {
      throw new TypeError('dataObject should be an instance of TestCollectionObject class')
    }
    if (dataObject.queryString === 'bad-value') return false
    super.add(label, dataObject)
    return true
  }
}

let pbCollection

// todo: split tests
// todo: check load and save

describe('A collection of TestCollectionObject objects', function () {
  beforeAll(() => {
    pbCollection = new TestCollectionFile(testObjLocation)
    pbCollection.fileHolder.delete()
  })

  afterAll(() => {
    pbCollection.fileHolder.delete()
  })

  it('should create and handle a collection file', async function () {
    const TestFile1 = new TestCollectionFile(testObjLocation)
    await TestFile1.fileHolder.load()
    expect(TestFile1.collection).toMatchObject({})

    expect(TestFile1.get('bad_label1')).toEqual(undefined)
    expect(function () {
      TestFile1.remove('bad_label1')
    }).not.toThrow()

    const pbq1 = new TestCollectionObject({
      label: 'my_label_11',
      queryString: 'bad-value'
    })
    expect(TestFile1.add('my_label_11', pbq1)).toEqual(false)

    const pbq2 = new TestCollectionObject({
      label: 'my_label_11',
      queryString: 'good-value1'
    })
    expect(TestFile1.add('my_label_11', pbq2)).toEqual(true)

    const testObj11 = TestFile1.get('my_label_11')
    expect(testObj11.label).toEqual('my_label_11')
    expect(testObj11.queryString).toEqual('good-value1')

    expect(TestFile1.has('my_label_11')).toEqual(true)
    expect(TestFile1.has('my_label_12')).toEqual(false)

    TestFile1.remove('my_label_11')
    expect(TestFile1.get('my_label_11')).toEqual(undefined)
    expect(TestFile1.has('my_label_11')).toEqual(false)

    const pbq3 = new TestCollectionObject({
      label: 'my_label_21',
      queryString: 'good-value2'
    })
    expect(TestFile1.add('my_label_21', pbq3)).toEqual(true)

    const pbq4 = new TestCollectionObject({
      label: 'my_label_31',
      queryString: 'good-value3'
    })
    expect(TestFile1.add('my_label_31', pbq4)).toEqual(true)

    const pbq5 = new TestCollectionObject({
      label: 'my_label_41',
      queryString: 'good-value4'
    })
    expect(TestFile1.add('my_label_41', pbq5)).toEqual(true)

    // TestFile1.forEach((testObj) => {
    //   expect(testObj.queryString).toEqual('good-value3')
    // })

    await TestFile1.fileHolder.save()

    const TestFile2 = new TestCollectionFile(testObjLocation)
    await TestFile2.fileHolder.load()

    const qf1Json = TestFile2.fileHolder.data
    expect(Object.keys(qf1Json).length).toEqual(3)
    expect(qf1Json[Object.keys(qf1Json)[2]].queryString).toEqual('good-value4')

    expect(TestFile2.get('my_label_21')).toBeInstanceOf(TestCollectionObject)
    expect(TestFile2.get('my_label_31')).toBeInstanceOf(TestCollectionObject)
    expect(TestFile2.get('my_label_41')).toBeInstanceOf(TestCollectionObject)

    // TestFile2.forEach((testObj) => {
    //   expect(testObj.queryString).toEqual('good-value2')
    // })

    expect(TestFile2.has('my_label_21')).toEqual(true)
    expect(TestFile2.has('my_label_31')).toEqual(true)
    expect(TestFile2.has('my_label_41')).toEqual(true)

    TestFile2.remove('my_label_21')
    TestFile2.remove('my_label_31')
    TestFile2.remove('my_label_41')

    expect(TestFile2.has('my_label_21')).toEqual(false)
    expect(TestFile2.has('my_label_31')).toEqual(false)
    expect(TestFile2.has('my_label_41')).toEqual(false)

    await TestFile2.fileHolder.save()

    expect(TestFile2.fileHolder.data).toEqual(null)
  })
})
