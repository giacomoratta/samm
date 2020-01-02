const { PathQuery } = require('../pathQuery.class')

describe('Query utility functions', function() {

  it("should process query strings", function() {

    const queryString1 = ',+ +,+, '
    const pathQuery1 = new PathQuery(queryString1)
    expect(pathQuery1.label).toEqual(null)
    expect(pathQuery1.queryString).toEqual(null)

    const queryString2 = 'le61+file1,+fi le3,+, '
    const pathQuery2 = new PathQuery(queryString2)
    expect(pathQuery2 instanceof Object).toEqual(true)
    expect(pathQuery2.check('/drd/file3/dsf')).toEqual(true)
    expect(pathQuery2.check('/drd/file/dsf')).toEqual(false)
    expect(pathQuery2.check('/drd/file1/dle61sf')).toEqual(true)
    expect(pathQuery2.check('/drd/file1/dled61sf')).toEqual(false)
  })
})
