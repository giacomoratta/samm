const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))

const { Config } = require('../../config')
const { PathQueryJsonFile } = require('../pathQueryJsonFile.class')
const { PathBasedQuery } = require('../pathBasedQuery.class')
const { fileUtils } = require('../../../core/utils/file.utils')

describe('query endpoints', function () {
  it('should create and handle a query file', function () {
    // reset file
    fileUtils.writeTextFileSync(Config.get('PathQueryFile'), '')

    const PathQueryFile1 = new PathQueryJsonFile(Config.get('PathQueryFile'))
    PathQueryFile1.load()
    expect(PathQueryFile1.QueryCollectionTemp).toMatchObject({})

    expect(PathQueryFile1.get('invalid_label1')).toEqual(undefined)
    expect(function () {
      PathQueryFile1.remove('invalid_label1')
    }).not.toThrow()

    expect(PathQueryFile1.add({
      label: 'my_label_11',
      queryString: ',+ +,+, '
    })).toEqual(false)

    expect(PathQueryFile1.add({
      label: 'my_label_11',
      queryString: 'le61+file1,+fi le3,+, '
    })).toEqual(true)

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

    expect(PathQueryFile1.add({
      label: 'my_label_21',
      queryString: 'le61+file1,+fi le3,+, '
    })).toEqual(true)

    expect(PathQueryFile1.add({
      label: 'my_label_31',
      queryString: 'le61+file1,+fi le3,+, '
    })).toEqual(true)

    expect(PathQueryFile1.add({
      label: 'my_label_41',
      queryString: 'le61+file1,+fi le3,+, '
    })).toEqual(true)

    PathQueryFile1.forEach((pathQuery) => {
      expect(pathQuery.queryString).toEqual('le61+file1,file3')
      expect(pathQuery.check('/drd/file3/dsf')).toEqual(true)
      expect(pathQuery.check('/drd/file/dsf')).toEqual(false)
      expect(pathQuery.check('/drd/file1/dle61sf')).toEqual(true)
      expect(pathQuery.check('/drd/file1/dled61sf')).toEqual(false)
    })

    PathQueryFile1.save()

    const qf1Json = fileUtils.readJsonFileSync(Config.get('PathQueryFile'))
    expect(qf1Json.QueryCollection.length).toEqual(3)
    expect(qf1Json.QueryCollection[2].queryString).toEqual('le61+file1,file3')

    const PathQueryFile2 = new PathQueryJsonFile(Config.get('PathQueryFile'))
    PathQueryFile2.load()

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

    PathQueryFile2.save()

    expect(fileUtils.readJsonFileSync(Config.get('PathQueryFile'))).toMatchObject({
      QueryCollection: []
    })
  })
})
