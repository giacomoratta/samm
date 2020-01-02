const utils = require('../utils')

describe('Query utility functions', function() {

  it("should process query strings", function() {

    const queryString1 = ',+ +,+, '
    const queryInfo1 = utils.processQueryString(queryString1)
    expect(queryInfo1).toEqual(null)

    const queryString2 = 'le61+file1,+fi le3,+, '
    const queryInfo2 = utils.processQueryString(queryString2)
    expect(queryInfo2 instanceof Object).toEqual(true)
    expect(queryInfo2.check('/drd/file3/dsf')).toEqual(true)
    expect(queryInfo2.check('/drd/file/dsf')).toEqual(false)
    expect(queryInfo2.check('/drd/file1/dle61sf')).toEqual(true)
    expect(queryInfo2.check('/drd/file1/dled61sf')).toEqual(false)
  })
})
