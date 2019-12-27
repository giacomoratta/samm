const { ConfigField, dataType } = require('./configField.class')

describe('configField class and object', function() {

    it("should catch errors on configField", function() {

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

    it("should create standard configFields", function() {

        let index = 1

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'empty',
            defaultValue: ''
        })}).toThrowError('invalid defaultValue')

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'integer',
            defaultValue: 12
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'integer',
            defaultValue: 12.2345
        })}).toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'number',
            defaultValue: 12
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'number',
            defaultValue: 12.2345
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'boolean',
            defaultValue: false
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'boolean',
            defaultValue: true
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'boolean',
            defaultValue: 'false'
        })}).toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'char',
            defaultValue: ''
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'char',
            defaultValue: 'a'
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'char',
            defaultValue: 'abc'
        })}).toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'string',
            defaultValue: ''
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'string',
            defaultValue: 'qwertyuio'
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'string',
            defaultValue: 123
        })}).toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'string',
            defaultValue: true
        })}).toThrow()


        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'array',
            defaultValue: []
        })}).toThrowError(`objectDatatype cannot be 'empty'`)

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'array',
            objectDatatype: 'array',
            defaultValue: []
        })}).toThrowError(`objectDatatype cannot be 'array'`)

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'array',
            objectDatatype: 'object',
            defaultValue: []
        })}).toThrowError(`objectDatatype cannot be 'object'`)

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'array',
            objectDatatype: 'integer',
            defaultValue: []
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'array',
            objectDatatype: 'integer',
            defaultValue: [ 12 ]
        })}).not.toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'array',
            objectDatatype: 'integer',
            defaultValue: [ 12.345 ]
        })}).toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'object',
            defaultValue: []
        })}).toThrowError(`objectDatatype cannot be 'empty'`)

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'object',
            objectDatatype: 'array',
            defaultValue: []
        })}).toThrowError(`objectDatatype cannot be 'array'`)

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'object',
            objectDatatype: 'object',
            defaultValue: []
        })}).toThrowError(`objectDatatype cannot be 'object'`)

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'object',
            objectDatatype: 'integer',
            defaultValue: []
        })}).toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'object',
            objectDatatype: 'integer',
            defaultValue: { key: 12.34 }
        })}).toThrow()

        expect(function(){ new ConfigField('field-name'+(index++), {
            dataType: 'object',
            objectDatatype: 'absDirPath',
            defaultValue: []
        })}).toThrow()

    })

})
