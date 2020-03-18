const path = require('path')
const testArrAscColl = path.join(__dirname, 'dir_test', 'test_arr_asc_coll.json')
const testArrDescColl = path.join(__dirname, 'dir_test', 'test_arr_desc_coll.json')
const { TestCollectionFile, bulkInsertArrayType } = require('./jsonCollectionHelper.test')

/* TestFile<Object|Array><Asc|Desc> */
let TestFileAA1, TestFileAD1, TestFileAA2, TestFileAD2

async function __clean () {
  await TestFileAA1.fileHolder.delete()
  await TestFileAA2.fileHolder.delete()
  await TestFileAD1.fileHolder.delete()
  await TestFileAD2.fileHolder.delete()
}

describe('A collection ARRAY of test objects', function () {
  beforeAll(async function () {
    TestFileAA1 = new TestCollectionFile(testArrAscColl, /* test options */ {
      orderType: 'ASC',
      collectionType: 'array',
      collectionMaxSize: 3
    })
    TestFileAD1 = new TestCollectionFile(testArrDescColl, /* test options */ {
      orderType: 'DESC',
      collectionType: 'array',
      collectionMaxSize: 3
    })
    TestFileAA2 = new TestCollectionFile(testArrAscColl, /* test options */ {
      orderType: 'ASC',
      collectionType: 'array',
      collectionMaxSize: 3
    })
    TestFileAD2 = new TestCollectionFile(testArrDescColl, /* test options */ {
      orderType: 'DESC',
      collectionType: 'array',
      collectionMaxSize: 3
    })

    await __clean()
    await expect(TestFileAA1.fileHolder.load()).resolves.toEqual(false)
    await expect(TestFileAD1.fileHolder.load()).resolves.toEqual(false)
  })

  afterAll(async function () {
    await __clean()
  })

  it('basic flow with array ASC max size 3', async function () {
    bulkInsertArrayType(TestFileAA1)

    function checkArrayOrderASC (TFObj, testNumber) {
      let i = 0
      expect(TFObj.collection.get(i++).label).toEqual('my_label_21')
      if (testNumber === 0) expect(TFObj.collection.get(i++).label).toEqual('my_label_31')
      expect(TFObj.collection.get(i++).label).toEqual('my_label_41')
      expect(TFObj.collection.get(i++)).toEqual(undefined)

      expect(TFObj.collection.latest.label).toEqual(TFObj.collection.get(2 - testNumber).label)
      expect(TFObj.collection.latest.label).toEqual('my_label_41')
      expect(TFObj.collection.oldest.label).toEqual(TFObj.collection.get(0).label)
      expect(TFObj.collection.oldest.label).toEqual('my_label_21')
      expect(TFObj.collection.size).toEqual(3 - testNumber)
    }
    checkArrayOrderASC(TestFileAA1, 0)
    expect(TestFileAA1.collection.remove(1)).toEqual(true)

    await TestFileAA1.fileHolder.save()
    await TestFileAA2.fileHolder.load()

    checkArrayOrderASC(TestFileAA2, 1)

    TestFileAA1.fileHolder.clean()
    TestFileAA2.fileHolder.clean()
    TestFileAA1.collection.clean()
    TestFileAA2.collection.clean()
  })

  it('basic flow with array DESC and max size 3', async function () {
    bulkInsertArrayType(TestFileAD1)

    function checkArrayOrderDESC (TFObj, testNumber) {
      let i = 0
      expect(TFObj.collection.get(i++).label).toEqual('my_label_41')
      if (testNumber === 0) expect(TFObj.collection.get(i++).label).toEqual('my_label_31')
      expect(TFObj.collection.get(i++).label).toEqual('my_label_21')
      expect(TFObj.collection.get(i++)).toEqual(undefined)

      expect(TFObj.collection.oldest.label).toEqual(TFObj.collection.get(2 - testNumber).label)
      expect(TFObj.collection.oldest.label).toEqual('my_label_21')
      expect(TFObj.collection.latest.label).toEqual(TFObj.collection.get(0).label)
      expect(TFObj.collection.latest.label).toEqual('my_label_41')
      expect(TFObj.collection.size).toEqual(3 - testNumber)
    }
    checkArrayOrderDESC(TestFileAD1, 0)
    expect(TestFileAD1.collection.remove(1)).toEqual(true)

    await TestFileAD1.fileHolder.save()
    await TestFileAD2.fileHolder.load()

    checkArrayOrderDESC(TestFileAD2, 1)

    TestFileAD1.fileHolder.clean()
    TestFileAD2.fileHolder.clean()
    TestFileAD1.collection.clean()
    TestFileAD2.collection.clean()
  })
})
