
/*
* T2
*
* load config file
* save config file
*/

/*
* set flags from outside
* set flags (in 'on' method of a field)
* check flags
* print flags
*
* */

const { JsonizedFile } = require('../index')
const jszFile1 = new JsonizedFile()

describe('JsonizedFile set file holder', function() {

    it("should set a file holder", function() {

        jszFile1.setFileHolder()

    })

})
