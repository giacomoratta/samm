const { PathBasedQuery } = require('../pathBasedQuery.class')

describe('PathBasedQuery class', function () {
  it('should process invalid query string', function () {
    const queryString1 = ',+ +,+, '
    const pathQuery1 = new PathBasedQuery(queryString1)
    expect(pathQuery1.label).toEqual(null)
    expect(pathQuery1.queryString).toEqual(null)
    expect(pathQuery1.isValid()).toEqual(false)
  })

  it('should process and clean query string', function () {
    const queryString2 = 'le61+file1,+fi le3,+, '
    const pathQuery2 = new PathBasedQuery(queryString2)

    expect(PathBasedQuery.generateQueryStringLabel(queryString2)).toEqual('le61_file1_file3')
    expect(pathQuery2.label).toEqual('le61_file1_file3')
    pathQuery2.label = 'my_label_222'
    expect(pathQuery2.label).toEqual('my_label_222')

    expect(pathQuery2.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery2.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery2.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery2.check('/drd/file1/dled61sf')).toEqual(false)

    expect(pathQuery2.toJson()).toMatchObject({
      functionBody: 'const s = v.toLowerCase(); if ( s.indexOf(\'le61\')>=0 && s.indexOf(\'file1\')>=0 ) return true; if ( s.indexOf(\'file3\')>=0 ) return true; return false;',
      label: 'my_label_222',
      queryString: 'le61+file1,file3'
    })
  })

  it('should clone a PathBasedQuery object', function () {
    const queryString2 = 'le61+file1,+fi le3,+, '
    const pathQuery2 = new PathBasedQuery(queryString2)
    pathQuery2.label = 'my_label_222'

    const pathQuery2B = pathQuery2.clone()
    expect(pathQuery2B.label).toEqual('my_label_222')
    pathQuery2B.label = 'my_label_333'
    expect(pathQuery2B.label).toEqual('my_label_333')
    expect(pathQuery2.label).toEqual('my_label_222')
    expect(pathQuery2B.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery2B.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery2B.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery2B.check('/drd/file1/dled61sf')).toEqual(false)
  })

  it('should import/export PathBasedQuery as json', function () {
    const jsonPQ = {
      functionBody: 'const s = v.toLowerCase(); if ( s.indexOf(\'le61\')>=0 && s.indexOf(\'file1\')>=0 ) return true; if ( s.indexOf(\'file3\')>=0 ) return true; return false;',
      label: 'my_label_222',
      queryString: 'le61+file1,file3'
    }
    const pathQuery3 = new PathBasedQuery()
    pathQuery3.fromJson(jsonPQ)
    expect(pathQuery3.label).toEqual('my_label_222')
    expect(pathQuery3.isValid()).toEqual(true)
    expect(pathQuery3.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery3.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery3.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery3.check('/drd/file1/dled61sf')).toEqual(false)
    expect(pathQuery3.toJson()).toMatchObject(jsonPQ)
  })
})
