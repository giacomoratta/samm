const path = require('path')
const testObjAscColl = path.join(__dirname, 'dir_test', 'test_obj_asc_coll.json')
const testObjDescColl = path.join(__dirname, 'dir_test', 'test_obj_desc_coll.json')
const { TestCollectionFile, bulkInsertObjectType } = require('./jsonCollectionHelper.test')

/* TestFile<Object|Array><Asc|Desc> */
let TestFileOA1, TestFileOD1, TestFileOA2, TestFileOD2

async function __clean () {
  await TestFileOA1.fileHolder.delete()
  await TestFileOA2.fileHolder.delete()
  await TestFileOD1.fileHolder.delete()
  await TestFileOD2.fileHolder.delete()
}

describe('A collection OBJECT of test objects', function () {
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

    await __clean()
    await expect(TestFileOA1.fileHolder.load()).resolves.toEqual(false)
    await expect(TestFileOD1.fileHolder.load()).resolves.toEqual(false)
  })

  afterAll(async function () {
    await __clean()
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

    function checkFileDataASC (TFObj, testNumber) {
      let i = 0
      const objKeys = Object.keys(TFObj.fileHolder.data)
      expect(objKeys[i++]).toEqual('my_label_11')
      expect(objKeys[i++]).toEqual('my_label_21')
      if (testNumber === 0) expect(objKeys[i]).toEqual('my_label_31')
      expect(objKeys[i++]).toEqual('my_label_41')
      expect(objKeys[i++]).toEqual(undefined)
    }

    checkObjectOrderASC(TestFileOA1, 0)
    expect(TestFileOA1.collection.remove('my_label_31')).toEqual(true)

    await TestFileOA1.fileHolder.save()
    await TestFileOA2.fileHolder.load()

    checkObjectOrderASC(TestFileOA2, 1)
    checkFileDataASC(TestFileOA2, 1)

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

    function checkFileDataDESC (TFObj, testNumber) {
      let i = 0
      const objKeys = Object.keys(TFObj.fileHolder.data)
      expect(objKeys[i++]).toEqual('my_label_41')
      if (testNumber === 0) expect(objKeys[i]).toEqual('my_label_31')
      expect(objKeys[i++]).toEqual('my_label_21')
      expect(objKeys[i++]).toEqual('my_label_11')
      expect(objKeys[i++]).toEqual(undefined)
    }

    checkObjectOrderDESC(TestFileOD1, 0)
    expect(TestFileOD1.collection.remove('my_label_31')).toEqual(true)

    await TestFileOD1.fileHolder.save()
    await TestFileOD2.fileHolder.load()

    checkObjectOrderDESC(TestFileOD2, 1)
    checkFileDataDESC(TestFileOD2, 1)

    TestFileOD1.fileHolder.clean()
    TestFileOD2.fileHolder.clean()
    TestFileOD1.collection.clean()
    TestFileOD2.collection.clean()
  })
})
