const cliParam = require('../cliParam.class')

describe('cliParam class and object', function() {

    it("should create an empty cliParam", function() {
        const cliParam1 = new cliParam()

        expect(cliParam1.isValid()).toEqual(false)
    })

})
