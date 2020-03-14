const path = require('path')
const testObjLocation = path.join(__dirname, 'dir_test', 'test_array_collection.json')
const { TestCollectionObject, TestCollectionFile } = require('./jsonCollectionHelper.test')

let pbCollection

// todo: split tests
// todo: checkFn
// todo: check load and save
// todo: check ASC and DESC
// todo: collectionMaxLength

describe('A collection of TestCollectionObject objects', function () {
  beforeAll(async function () {
    pbCollection = new TestCollectionFile(testObjLocation, /* test options */ {
      orderType: 'ASC',
      collectionType: 'array'
    })
    await pbCollection.fileHolder.delete()
  })

  afterAll(async function () {
    await pbCollection.fileHolder.delete()
  })

  it('load and save empty file', async function () { })

  it('basic flow with ASC + collectionMaxLength', async function () {
    // check order
    // and wrong values
    // save, load and check order
  })

  it('basic flow with DESC + collectionMaxLength', async function () {
    // check order
    // and wrong values
    // save, load and check order
  })

  it('should create and handle a collection file', async function () {
    const TestFile1 = new TestCollectionFile(testObjLocation, /* test options */ {
      orderType: 'ASC',
      collectionType: 'array'
    })
    await TestFile1.fileHolder.load()
    expect(TestFile1.fileHolder.data).toEqual(null)

    expect(TestFile1.collection.get('bad_label1')).toEqual(undefined)
    expect(function () {
      TestFile1.collection.remove('bad_label1')
    }).not.toThrow()

    const pbq2 = new TestCollectionObject({
      label: 'my_label_11',
      queryString: 'good-value1'
    })
    expect(TestFile1.collection.add(pbq2)).toEqual(true)

    const testObj11 = TestFile1.collection.get(0)
    expect(testObj11.label).toEqual('my_label_11')
    expect(testObj11.queryString).toEqual('good-value1')

    expect(TestFile1.collection.has(0)).toEqual(true)
    expect(TestFile1.collection.has(1)).toEqual(false)

    TestFile1.collection.remove()
    expect(TestFile1.collection.get(0)).toEqual(undefined)
    expect(TestFile1.collection.has(0)).toEqual(false)

    const pbq3 = new TestCollectionObject({
      label: 'my_label_21',
      queryString: 'good-value2'
    })
    expect(TestFile1.collection.add(pbq3)).toEqual(true)

    const pbq4 = new TestCollectionObject({
      label: 'my_label_31',
      queryString: 'good-value3'
    })
    expect(TestFile1.collection.add(pbq4)).toEqual(true)

    const pbq5 = new TestCollectionObject({
      label: 'my_label_41',
      queryString: 'good-value4'
    })
    expect(TestFile1.collection.add(pbq5)).toEqual(true)

    // TestFile1.collection.forEach((testObj) => {
    //   expect(testObj.queryString).toEqual('good-value3')
    // })

    await TestFile1.fileHolder.save()

    const TestFile2 = new TestCollectionFile(testObjLocation, /* test options */ {
      orderType: 'ASC',
      collectionType: 'array'
    })
    await TestFile2.fileHolder.load()

    const qf1Json = TestFile2.fileHolder.data
    expect(qf1Json.array.length).toEqual(3)
    expect(qf1Json.array[2].queryString).toEqual('good-value2')

    expect(TestFile2.collection.get(0)).toBeInstanceOf(TestCollectionObject)
    expect(TestFile2.collection.get(1)).toBeInstanceOf(TestCollectionObject)
    expect(TestFile2.collection.get(2)).toBeInstanceOf(TestCollectionObject)

    // TestFile2.collection.forEach((testObj) => {
    //   expect(testObj.queryString).toEqual('good-value2')
    // })

    expect(TestFile2.collection.has(0)).toEqual(true)
    expect(TestFile2.collection.has(1)).toEqual(true)
    expect(TestFile2.collection.has(2)).toEqual(true)

    TestFile2.collection.remove(0)
    TestFile2.collection.remove(1)
    TestFile2.collection.remove(2)

    expect(TestFile2.collection.has(0)).toEqual(false)
    expect(TestFile2.collection.has(1)).toEqual(false)
    expect(TestFile2.collection.has(2)).toEqual(false)

    await TestFile2.fileHolder.save()

    expect(TestFile2.fileHolder.data).toEqual(null)
  })
})
