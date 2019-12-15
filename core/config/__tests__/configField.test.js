const { ConfigField, dataType } = require('../configField.class')

describe('configField class and object', function() {

    it("should create a standard configField", function() {

        expect(function(){ new ConfigField() }).toThrowError('field name')
        expect(function(){ new ConfigField('field-name') }).toThrowError('options')

        expect(function(){ new ConfigField('field-name',{
            dataType:'invalid-type'
        }) }).toThrowError('invalid dataType')

        expect(function(){ new ConfigField('field-name',{
            objectDatatype:'invalid-type'
        }) }).toThrowError('invalid objectDatatype')

        expect(function(){ new ConfigField('field-name',{
            objectDatatype:'array'
        }) }).toThrowError('objectDatatype cannot be')

        expect(function(){ new ConfigField('field-name',{
            objectDatatype:'object'
        }) }).toThrowError('objectDatatype cannot be')

        expect(function(){ new ConfigField('field-name',{
            dataType:'array'
        }) }).toThrowError(`objectDatatype cannot be 'empty'`)

        expect(function(){ new ConfigField('field-name',{
            dataType:'object'
        }) }).toThrowError(`objectDatatype cannot be 'empty'`)

        //const configField1 = new ConfigField('myfield1',{})


        //console.log(configField1.error())

        //expect(configField.isValid()).toEqual(false)
    })

})
