const path = require('path')
const pathQueryLocation = path.join(__dirname, 'path_query.json')

const { PathQueryCollection } = require('../pathQueryCollection.class')
const { PathBasedQuery } = require('../pathBasedQuery.class')

let pbCollection

// todo: split tests
// todo: check load and save

describe('A collection of PathBasedQuery objects', function () {
  beforeAll(() => {
    pbCollection = new PathQueryCollection(pathQueryLocation)
    pbCollection.fileHolder.delete()
  })

  afterAll(() => {
    pbCollection.fileHolder.delete()
  })

  it('should create and handle a query file', async function () {
    const PathQueryFile1 = new PathQueryCollection(pathQueryLocation)
    await PathQueryFile1.fileHolder.load()
    expect(PathQueryFile1.collection).toMatchObject({})

    expect(PathQueryFile1.get('invalid_label1')).toEqual(undefined)
    expect(function () {
      PathQueryFile1.remove('invalid_label1')
    }).not.toThrow()

    const pbq1 = new PathBasedQuery()
    pbq1.fromJson({
      label: 'my_label_11',
      queryString: ',+ +,+, '
    })
    expect(PathQueryFile1.add('my_label_11', pbq1)).toEqual(false)

    const pbq2 = new PathBasedQuery()
    pbq2.fromJson({
      label: 'my_label_11',
      queryString: 'le61+file1,+fi le3,+, '
    })
    expect(PathQueryFile1.add('my_label_11', pbq2)).toEqual(true)

    const pathQuery11 = PathQueryFile1.get('my_label_11')
    expect(pathQuery11.label).toEqual('my_label_11')
    expect(pathQuery11.queryString).toEqual('le61+file1,file3')
    expect(pathQuery11.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery11.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery11.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery11.check('/drd/file1/dled61sf')).toEqual(false)

    expect(PathQueryFile1.has('my_label_11')).toEqual(true)
    expect(PathQueryFile1.has('my_label_12')).toEqual(false)

    PathQueryFile1.remove('my_label_11')
    expect(PathQueryFile1.get('my_label_11')).toEqual(undefined)
    expect(PathQueryFile1.has('my_label_11')).toEqual(false)

    const pbq3 = new PathBasedQuery()
    pbq3.fromJson({
      label: 'my_label_21',
      queryString: 'le61+file1,+fi le3,+, '
    })
    expect(PathQueryFile1.add('my_label_21', pbq3)).toEqual(true)

    const pbq4 = new PathBasedQuery()
    pbq4.fromJson({
      label: 'my_label_31',
      queryString: 'le61+file1,+fi le3,+, '
    })
    expect(PathQueryFile1.add('my_label_31', pbq4)).toEqual(true)

    const pbq5 = new PathBasedQuery()
    pbq5.fromJson({
      label: 'my_label_41',
      queryString: 'le61+file1,+fi le3,+, '
    })
    expect(PathQueryFile1.add('my_label_41', pbq5)).toEqual(true)

    PathQueryFile1.forEach((pathQuery) => {
      expect(pathQuery.queryString).toEqual('le61+file1,file3')
      expect(pathQuery.check('/drd/file3/dsf')).toEqual(true)
      expect(pathQuery.check('/drd/file/dsf')).toEqual(false)
      expect(pathQuery.check('/drd/file1/dle61sf')).toEqual(true)
      expect(pathQuery.check('/drd/file1/dled61sf')).toEqual(false)
    })

    await PathQueryFile1.fileHolder.save()

    const PathQueryFile2 = new PathQueryCollection(pathQueryLocation)
    await PathQueryFile2.fileHolder.load()

    const qf1Json = PathQueryFile2.fileHolder.data
    expect(Object.keys(qf1Json).length).toEqual(3)
    expect(qf1Json[Object.keys(qf1Json)[2]].queryString).toEqual('le61+file1,file3')

    expect(PathQueryFile2.get('my_label_21')).toBeInstanceOf(PathBasedQuery)
    expect(PathQueryFile2.get('my_label_31')).toBeInstanceOf(PathBasedQuery)
    expect(PathQueryFile2.get('my_label_41')).toBeInstanceOf(PathBasedQuery)

    PathQueryFile2.forEach((pathQuery) => {
      expect(pathQuery.queryString).toEqual('le61+file1,file3')
      expect(pathQuery.check('/drd/file3/dsf')).toEqual(true)
      expect(pathQuery.check('/drd/file/dsf')).toEqual(false)
      expect(pathQuery.check('/drd/file1/dle61sf')).toEqual(true)
      expect(pathQuery.check('/drd/file1/dled61sf')).toEqual(false)
    })

    expect(PathQueryFile2.has('my_label_21')).toEqual(true)
    expect(PathQueryFile2.has('my_label_31')).toEqual(true)
    expect(PathQueryFile2.has('my_label_41')).toEqual(true)

    PathQueryFile2.remove('my_label_21')
    PathQueryFile2.remove('my_label_31')
    PathQueryFile2.remove('my_label_41')

    expect(PathQueryFile2.has('my_label_21')).toEqual(false)
    expect(PathQueryFile2.has('my_label_31')).toEqual(false)
    expect(PathQueryFile2.has('my_label_41')).toEqual(false)

    await PathQueryFile2.fileHolder.save()

    expect(PathQueryFile2.fileHolder.data).toEqual(null)
  })
})
