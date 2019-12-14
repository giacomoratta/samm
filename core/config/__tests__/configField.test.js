const ConfigField = require('../configField.class')

describe('configField class and object', function() {

    it("should create a standard configField", function() {

        expect(function(){ new ConfigField() }).toThrow()

        const configField1 = new ConfigField('myfield1')


        console.log(configField1.error())

        //expect(configField.isValid()).toEqual(false)
    })

})
