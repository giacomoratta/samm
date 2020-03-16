const path = require('path')
const testObjAscColl = path.join(__dirname, 'dir_test', 'test_obj_asc_coll.json')
const testObjDescColl = path.join(__dirname, 'dir_test', 'test_obj_desc_coll.json')
const { JsonCollectionFile } = require('../jsonCollectionFile.class')
const { TestCollectionObject, TestCollectionFile, bulkInsertObjectType, bulkInsertArrayType } = require('./jsonCollectionHelper.test')

/* TestFile<Object|Array><Asc|Desc> */
let TestFileOA1, TestFileOD1, TestFileAA1, TestFileAD1
let TestFileOA2, TestFileOD2, TestFileAA2, TestFileAD2

describe('A collection of TestCollectionObject objects', function () {
  beforeAll(async function () {
    TestFileOA1 = new TestCollectionFile(testObjAscColl, /* test options */ {
      orderType: 'ASC',
      collectionType: 'object'
    })
    TestFileOD1 = new TestCollectionFile(testObjDescColl, /* test options */ {
      orderType: 'DESC',
      collectionType: 'object'
    })
    TestFileOA2 = new TestCollectionFile(testObjAscColl, /* test options */ {
      orderType: 'ASC',
      collectionType: 'object'
    })
    TestFileOD2 = new TestCollectionFile(testObjDescColl, /* test options */ {
      orderType: 'DESC',
      collectionType: 'object'
    })

    TestFileAA1 = new TestCollectionFile(testObjAscColl, /* test options */ {
      orderType: 'ASC',
      collectionType: 'array'
    })
    TestFileAD1 = new TestCollectionFile(testObjDescColl, /* test options */ {
      orderType: 'DESC',
      collectionType: 'array',
      collectionMaxSize: 3
    })
    TestFileAA2 = new TestCollectionFile(testObjAscColl, /* test options */ {
      orderType: 'ASC',
      collectionType: 'array'
    })
    TestFileAD2 = new TestCollectionFile(testObjDescColl, /* test options */ {
      orderType: 'DESC',
      collectionType: 'array',
      collectionMaxSize: 3
    })

    await TestFileOA1.fileHolder.delete()
    await TestFileOA2.fileHolder.delete()
    await TestFileOD1.fileHolder.delete()
    await TestFileOD2.fileHolder.delete()
    await expect(TestFileOA1.fileHolder.load()).resolves.toEqual(false)
    await expect(TestFileOD1.fileHolder.load()).resolves.toEqual(false)
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

    function checkObjectOrderASC (TFObj, testNumber) {
      let i = 0
      expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_11')
      expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_21')
      if (testNumber === 0) expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_31')
      expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_41')
      expect(TFObj.collection.getByIndex(i++)).toEqual(undefined)
    }

    checkObjectOrderASC(TestFileOA1, 0)
    expect(TestFileOA1.collection.remove('my_label_31')).toEqual(true)

    await TestFileOA1.fileHolder.save()
    await TestFileOA2.fileHolder.load()
    checkObjectOrderASC(TestFileOA2, 1)

    TestFileOA1.fileHolder.clean()
    TestFileOA2.fileHolder.clean()
    TestFileOA1.collection.clean()
    TestFileOA2.collection.clean()
  })

  it('basic flow with object DESC', async function () {
    bulkInsertObjectType(TestFileOD1)

    function checkObjectOrderDESC (TFObj, testNumber) {
      let i = 0
      expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_41')
      if (testNumber === 0) expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_31')
      expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_21')
      expect(TFObj.collection.getByIndex(i++).label).toEqual('my_label_11')
      expect(TFObj.collection.getByIndex(i++)).toEqual(undefined)
    }

    checkObjectOrderDESC(TestFileOD1, 0)
    expect(TestFileOD1.collection.remove('my_label_31')).toEqual(true)

    await TestFileOD1.fileHolder.save()
    await TestFileOD2.fileHolder.load()

    checkObjectOrderDESC(TestFileOD2, 1)

    TestFileOD1.fileHolder.clean()
    TestFileOD2.fileHolder.clean()
    TestFileOD1.collection.clean()
    TestFileOD2.collection.clean()
  })

  it('basic flow with array ASC', async function () {
    bulkInsertArrayType(TestFileAA1)

    function checkArrayOrderASC (TFObj, testNumber) {
      let i = 0
      expect(TFObj.collection.get(i++).label).toEqual('my_label_11')
      expect(TFObj.collection.get(i++).label).toEqual('my_label_21')
      if (testNumber === 0) expect(TFObj.collection.get(i++).label).toEqual('my_label_31')
      expect(TFObj.collection.get(i++).label).toEqual('my_label_41')
      expect(TFObj.collection.get(i++)).toEqual(undefined)

      expect(TFObj.collection.latest.label).toEqual(TFObj.collection.get(3 - testNumber).label)
      expect(TFObj.collection.oldest.label).toEqual(TFObj.collection.get(0).label)
    }
    checkArrayOrderASC(TestFileAA1, 0)
    expect(TestFileAA1.collection.remove(2)).toEqual(true)

    await TestFileAA1.fileHolder.save()
    await TestFileAA2.fileHolder.load()

    checkArrayOrderASC(TestFileAA2, 1)

    TestFileAA1.fileHolder.clean()
    TestFileAA2.fileHolder.clean()
    TestFileAA1.collection.clean()
    TestFileAA2.collection.clean()
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
      return new JsonCollectionFile({ filePath: testObjAscColl, itemsClass: example })
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
      return new JsonCollectionFile({ filePath: testObjAscColl, itemsClass: example })
    }).not.toThrow()
  })
})
