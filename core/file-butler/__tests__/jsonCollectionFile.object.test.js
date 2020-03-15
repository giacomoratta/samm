const path = require('path')
const testObjLocation = path.join(__dirname, 'dir_test', 'test_obj_collection.json')
const { JsonCollectionFile } = require('../jsonCollectionFile.class')
const { TestCollectionObject, TestCollectionFile } = require('./jsonCollectionHelper.test')

/* TestFile<Object|Array><Asc|Desc> */
let TestFileOA1, TestFileOD1, TestFileAA1, TestFileAD1

// todo: split tests
// todo: checkFn
// todo: check load and save
// todo: check ASC and DESC

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

describe('A collection of TestCollectionObject objects', function () {
  beforeAll(async function () {
    TestFileOA1 = new TestCollectionFile(testObjLocation, /* test options */ {
      orderType: 'ASC',
      collectionType: 'object'
    })
    TestFileOD1 = new TestCollectionFile(testObjLocation, /* test options */ {
      orderType: 'DESC',
      collectionType: 'object'
    })
    await TestFileOA1.fileHolder.delete()
    await TestFileOD1.fileHolder.delete()
    await expect(TestFileOA1.fileHolder.load()).resolves.toEqual(false)
  })

  afterAll(async function () {
    await TestFileOA1.fileHolder.delete()
    await TestFileOD1.fileHolder.delete()
  })

  it('operations with empty collection', async function () {
    expect(TestFileOA1.fileHolder.data).toEqual(null)
    expect(TestFileOA1.collection.size).toEqual(0)

    expect(TestFileOA1.collection.get('bad_label1')).toEqual(undefined)
    expect(TestFileOA1.collection.has('bad_label1')).toEqual(false)
    expect(function () {
      TestFileOA1.collection.remove('bad_label1')
    }).not.toThrow()

    expect(function () {
      TestFileOA1.collection.forEach((key, item) => {
        console.log(key, item)
      })
    }).not.toThrow()
  })

  it('try to insert a wrong object', async function () {
    expect(function () {
      TestFileOA1.collection.add('my_label_11', new Object({
        label: 'my_label_11',
        queryString: 'bad-value'
      }))
    }).toThrow('the object should be an instance of')
    expect(TestFileOA1.collection.size).toEqual(0)
  })

  it('basic flow with object ASC', async function () {
    bulkInsertObjectType(TestFileOA1)
    // checkObjectOrderASC()
    // remove 1
    // save, load (new repo), bulkCheckObjectType()
    // checkObjectOrderASC()
    TestFileOA1.fileHolder.data = null
    TestFileOA1.collection.clean()
  })

  it('basic flow with object DESC', async function () {
    bulkInsertObjectType(TestFileOD1)
    // checkObjectOrderDESC()
    // remove 1
    // save, load (new repo), bulkCheckObjectType()
    // checkObjectOrderDESC()
    TestFileOA1.fileHolder.data = null
    TestFileOA1.collection.clean()
  })

  it('basic flow with array ASC', async function () {
    bulkInsertObjectType(TestFileAA1)
    // checkObjectOrderASC()
    // remove 1
    // save, load (new repo), bulkCheckObjectType()
    // checkObjectOrderASC()
    TestFileOA1.fileHolder.data = null
    TestFileOA1.collection.clean()
  })

  it('basic flow with array DESC and max size 3', async function () {
    bulkInsertObjectType(TestFileAD1)
    // checkObjectOrderDESC()
    // remove 1
    // save, load (new repo), bulkCheckObjectType()
    // checkObjectOrderDESC()
    TestFileOA1.fileHolder.data = null
    TestFileOA1.collection.clean()
  })

  it('should create and handle a collection file', async function () {
    const TestFileOA1 = new TestCollectionFile(testObjLocation, /* test options */ {
      orderType: 'ASC',
      collectionType: 'object'
    })
    await TestFileOA1.fileHolder.load()
    expect(TestFileOA1.fileHolder.data).toEqual(null)
    // ---------------------

    expect(TestFileOA1.collection.get('bad_label1')).toEqual(undefined)
    expect(function () {
      TestFileOA1.collection.remove('bad_label1')
    }).not.toThrow()

    const pbq1 = new TestCollectionObject({
      label: 'my_label_11',
      queryString: 'bad-value'
    })
    expect(TestFileOA1.collection.add('my_label_11', pbq1)).toEqual(false)

    const pbq2 = new TestCollectionObject({
      label: 'my_label_11',
      queryString: 'good-value1'
    })
    expect(TestFileOA1.collection.add('my_label_11', pbq2)).toEqual(true)

    const testObj11 = TestFileOA1.collection.get('my_label_11')
    expect(testObj11.label).toEqual('my_label_11')
    expect(testObj11.queryString).toEqual('good-value1')

    expect(TestFileOA1.collection.has('my_label_11')).toEqual(true)
    expect(TestFileOA1.collection.has('my_label_12')).toEqual(false)

    TestFileOA1.collection.remove('my_label_11')
    expect(TestFileOA1.collection.get('my_label_11')).toEqual(undefined)
    expect(TestFileOA1.collection.has('my_label_11')).toEqual(false)

    const pbq3 = new TestCollectionObject({
      label: 'my_label_21',
      queryString: 'good-value2'
    })
    expect(TestFileOA1.collection.add('my_label_21', pbq3)).toEqual(true)

    const pbq4 = new TestCollectionObject({
      label: 'my_label_31',
      queryString: 'good-value3'
    })
    expect(TestFileOA1.collection.add('my_label_31', pbq4)).toEqual(true)

    const pbq5 = new TestCollectionObject({
      label: 'my_label_41',
      queryString: 'good-value4'
    })
    expect(TestFileOA1.collection.add('my_label_41', pbq5)).toEqual(true)

    // TestFileOA1.collection.forEach((testObj) => {
    //   expect(testObj.queryString).toEqual('good-value3')
    // })

    await TestFileOA1.fileHolder.save()

    const TestFileOD1 = new TestCollectionFile(testObjLocation, /* test options */ {
      orderType: 'ASC',
      collectionType: 'object'
    })
    await TestFileOD1.fileHolder.load()

    const qf1Json = TestFileOD1.fileHolder.data
    expect(Object.keys(qf1Json).length).toEqual(3)
    expect(qf1Json[Object.keys(qf1Json)[2]].queryString).toEqual('good-value4')

    expect(TestFileOD1.collection.get('my_label_21')).toBeInstanceOf(TestCollectionObject)
    expect(TestFileOD1.collection.get('my_label_31')).toBeInstanceOf(TestCollectionObject)
    expect(TestFileOD1.collection.get('my_label_41')).toBeInstanceOf(TestCollectionObject)

    // TestFileOD1.collection.forEach((testObj) => {
    //   expect(testObj.queryString).toEqual('good-value2')
    // })

    expect(TestFileOD1.collection.has('my_label_21')).toEqual(true)
    expect(TestFileOD1.collection.has('my_label_31')).toEqual(true)
    expect(TestFileOD1.collection.has('my_label_41')).toEqual(true)

    TestFileOD1.collection.remove('my_label_21')
    TestFileOD1.collection.remove('my_label_31')
    TestFileOD1.collection.remove('my_label_41')

    expect(TestFileOD1.collection.has('my_label_21')).toEqual(false)
    expect(TestFileOD1.collection.has('my_label_31')).toEqual(false)
    expect(TestFileOD1.collection.has('my_label_41')).toEqual(false)

    await TestFileOD1.fileHolder.save()

    expect(TestFileOD1.fileHolder.data).toEqual(null)
  })

  it('should throw some errors', function () {
    expect(function () {
      const tf = new JsonCollectionFile({})
    }).toThrow('Missing mandatory argument: filePath')

    expect(function () {
      return new JsonCollectionFile({ filePath: 'abc' })
    }).toThrow('Missing mandatory argument: itemsClass')

    expect(function () {
      class example {
        constructor () { }
      }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('must have isValid method')

    expect(function () {
      class example {
        constructor () { }
        isValid () {}
        toJson () {}
        fromJson () {}
      }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('\'filePath\' option must be an absolute path')

    expect(function () {
      class example {
        constructor () { }
        isValid () {}
      }
      return new JsonCollectionFile({ filePath: testObjLocation, itemsClass: example })
    }).toThrow('must have toJson method')

    expect(function () {
      class example {
        constructor () { }
        isValid () {}
        toJson () {}
      }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('must have fromJson method')

    expect(function () {
      class example {
        constructor () { }
        isValid () {}
        toJson () {}
        fromJson () {}
      }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('\'filePath\' option must be an absolute path')

    expect(function () {
      class example {
        constructor () { }
        isValid () {}
        toJson () {}
        fromJson () {}
      }
      return new JsonCollectionFile({ filePath: testObjLocation, itemsClass: example })
    }).not.toThrow()
  })
})
