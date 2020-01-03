const { PathQuery } = require('../pathQuery.class')

describe('Query utility functions', function () {
  it('should process query strings', function () {
    const queryString1 = ',+ +,+, '
    const pathQuery1 = new PathQuery(queryString1)
    expect(pathQuery1.label).toEqual(null)
    expect(pathQuery1.queryString).toEqual(null)

    const queryString2 = 'le61+file1,+fi le3,+, '
    const pathQuery2 = new PathQuery(queryString2)

    expect(PathQuery.queryStringLabel(queryString2)).toEqual('le61+file1,+file3,+,')
    expect(pathQuery2.label).toEqual('le61+file1,+file3,+,')
    pathQuery2.label = 'my_label_222'
    expect(pathQuery2.label).toEqual('my_label_222')

    expect(pathQuery2 instanceof Object).toEqual(true)
    expect(pathQuery2.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery2.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery2.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery2.check('/drd/file1/dled61sf')).toEqual(false)

    expect(pathQuery2.toJson()).toMatchObject({
      functionBody: 'if ( s.indexOf(\'le61\')>=0 && s.indexOf(\'file1\')>=0 ) return true; if ( s.indexOf(\'file3\')>=0 ) return true; return false;',
      label: 'my_label_222',
      queryString: 'le61+file1,file3'
    })

    const pathQuery2B = pathQuery2.clone()
    expect(pathQuery2B.label).toEqual('my_label_222')
    pathQuery2B.label = 'my_label_333'
    expect(pathQuery2B.label).toEqual('my_label_333')
    expect(pathQuery2.label).toEqual('my_label_222')
    expect(pathQuery2B.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery2B.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery2B.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery2B.check('/drd/file1/dled61sf')).toEqual(false)

    const pathQuery3 = new PathQuery()
    pathQuery3.fromJson({
      functionBody: 'if ( s.indexOf(\'le61\')>=0 && s.indexOf(\'file1\')>=0 ) return true; if ( s.indexOf(\'file3\')>=0 ) return true; return false;',
      label: 'my_label_222',
      queryString: 'le61+file1,file3'
    })
    expect(pathQuery3.label).toEqual('my_label_222')
    expect(pathQuery3.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery3.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery3.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery3.check('/drd/file1/dled61sf')).toEqual(false)
  })
})
