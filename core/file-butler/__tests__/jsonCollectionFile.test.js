const path = require('path')
const testObjFilePath = path.join(__dirname, 'dir_test', 'test_obj_asc_coll.json')
const { JsonCollectionFile } = require('../jsonCollectionFile.class')
const { TestCollectionFile } = require('./jsonCollectionHelper.test')

let TestFileObj

describe('A collection of test objects', function () {
  beforeAll(async function () {
    TestFileObj = new TestCollectionFile(testObjFilePath, /* test options */ {
      orderType: 'ASC',
      collectionType: 'object'
    })
    await TestFileObj.fileHolder.delete()
  })

  afterAll(async function () {
    await TestFileObj.fileHolder.delete()
  })

  it('operations with empty collection', async function () {
    expect(TestFileObj.fileHolder.data).toEqual(null)
    expect(TestFileObj.collection.size).toEqual(0)

    expect(TestFileObj.collection.get('bad_label1')).toEqual(undefined)
    expect(TestFileObj.collection.has('bad_label1')).toEqual(false)
    expect(function () {
      TestFileObj.collection.remove('bad_label1')
    }).not.toThrow()

    expect(function () {
      TestFileObj.collection.forEach((key, item) => {
        console.log(key, item)
      })
    }).not.toThrow()
  })

  it('try to insert a wrong object', async function () {
    expect(function () {
      TestFileObj.collection.add('my_label_11', {
        label: 'my_label_11',
        queryString: 'bad-value'
      })
    }).toThrow('the object should be an instance of')
    expect(TestFileObj.collection.size).toEqual(0)
  })

  it('should throw some errors', function () {
    expect(function () {
      return new JsonCollectionFile({})
    }).toThrow('Missing mandatory argument: filePath')

    expect(function () {
      return new JsonCollectionFile({ filePath: 'abc' })
    }).toThrow('Missing mandatory argument: itemsClass')

    expect(function () {
      class example { }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('must have isValid method')

    expect(function () {
      class example {
        isValid () {}
        toJson () {}
        fromJson () {}
      }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('\'filePath\' option must be an absolute path')

    expect(function () {
      class example {
        isValid () {}
      }
      return new JsonCollectionFile({ filePath: testObjFilePath, itemsClass: example })
    }).toThrow('must have toJson method')

    expect(function () {
      class example {
        isValid () {}
        toJson () {}
      }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('must have fromJson method')

    expect(function () {
      class example {
        isValid () {}
        toJson () {}
        fromJson () {}
      }
      return new JsonCollectionFile({ filePath: 'abc', itemsClass: example })
    }).toThrow('\'filePath\' option must be an absolute path')

    expect(function () {
      class example {
        isValid () {}
        toJson () {}
        fromJson () {}
      }
      return new JsonCollectionFile({ filePath: testObjFilePath, itemsClass: example })
    }).not.toThrow()
  })
})
