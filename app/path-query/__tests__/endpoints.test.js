const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const fileUtils = require('../../../core/utils/file.utils')

const { Config } = require('../../config')
const Query = require('../index')

describe('query endpoints', function () {
  it('should perform basic operations', function () {
    fileUtils.writeTextFileSync(Config.get('PathQueryFile'), '')

    Query.add('my_label1', 'file1,file3')
    Query.add('my_label2', 'file2,file4')

    const pathQuery1 = Query.get('my_label1')
    expect(pathQuery1.label).toEqual('my_label1')
    expect(pathQuery1.queryString).toEqual('file1,file3')

    Query.save()
    expect(fileUtils.readJsonFileSync(Config.get('PathQueryFile'))).toMatchObject({
      QueryCollection: [
        {
          label: 'my_label1',
          functionBody: "if ( s.indexOf('file1')>=0 ) return true; if ( s.indexOf('file3')>=0 ) return true; return false;",
          queryString: 'file1,file3'
        },
        {
          label: 'my_label2',
          functionBody: "if ( s.indexOf('file2')>=0 ) return true; if ( s.indexOf('file4')>=0 ) return true; return false;",
          queryString: 'file2,file4'
        }
      ]
    })

    Query.create('file1,file3')
    Query.create('file1,file3')
    Query.create('file1,file3')

    const pqArray = Query.list()
    expect(pqArray[0].label).toEqual('my_label1')
    expect(pqArray[1].label).toEqual('my_label2')
    expect(pqArray.length).toEqual(2)

    Query.remove('my_label1')
    expect(Query.get('my_label1')).toEqual(undefined)

    Query.save()
    expect(fileUtils.readJsonFileSync(Config.get('PathQueryFile'))).toMatchObject({
      QueryCollection: [
        {
          label: 'my_label2',
          functionBody: "if ( s.indexOf('file2')>=0 ) return true; if ( s.indexOf('file4')>=0 ) return true; return false;",
          queryString: 'file2,file4'
        }
      ]
    })

    fileUtils.writeTextFileSync(Config.get('PathQueryFile'), '')
  })
})