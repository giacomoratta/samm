const cliInput = require('../cliInput.class')

describe('cliInput class and object', function() {

    it("should create an empty cliInput", function() {
        const cliInput1 = new cliInput()

        expect(cliInput1.isValid()).toEqual(false)
    })

})
