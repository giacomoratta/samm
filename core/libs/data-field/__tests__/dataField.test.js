const DataField = require('../dataField.class')

describe('dataField class and object', function() {

    it("should create a simple dataField with events", function() {

        const dataField1 = new DataField({
            name:'fieldname1',
            schema: { type: "number", positive: true, integer: true },
            value: 32
        })
        expect(dataField1.get()).toEqual(32)

        let eventFired = false
        let eventFiredData = null

        dataField1.on('change', (e) => {
            eventFiredData = e
            eventFired = true
        })

        dataField1.set(42)
        expect(dataField1.get()).toEqual(42)

        expect(eventFired).toEqual(true)
        expect(eventFiredData.fieldName).toEqual('fieldname1')
        expect(eventFiredData.oldValue).toEqual(32)
        expect(eventFiredData.newValue).toEqual(42)
    })


    it("should create a complex dataField", function() {

        const defaultValue = {
            id: 32,
            name: 'abcde12345',
            status: true,
            nested: {
                id: 42,
                name: 'fghil67890',
                status: false,
                listing: [
                    'elm1',
                    'elm2'
                ]
            }
        }

        const dataField1 = new DataField({
            name:'fieldname1',
            schema: {
                type: 'object',
                props: {
                    id: { type: "number", positive: true, integer: true },
                    name: { type: "string", min: 3, max: 255 },
                    status: "boolean",
                    nested: {
                        type: 'object',
                        props: {
                            id: { type: "number", positive: true, integer: true },
                            name: { type: "string", min: 3, max: 255 },
                            status: "boolean",
                            listing: { type: "array" }
                        }
                    }
                }
            },
            value: defaultValue
        })

        expect(dataField1.get()).toEqual(defaultValue)

        expect(function(){ dataField1.set({ invalid:'value' }) }).toThrow()

        const defaultValue1 = { ...defaultValue }
        defaultValue1.nested.listing = false
        expect(function(){ dataField1.set(defaultValue1) }).toThrow()

        try {
            dataField1.set({})
        } catch(e) {
            expect(e).toHaveProperty('errors')
            expect(e).toHaveProperty('message')

            expect(e.errors[0]).toHaveProperty('type')
            expect(e.errors[0]).toHaveProperty('expected')
            expect(e.errors[0]).toHaveProperty('actual')
            expect(e.errors[0]).toHaveProperty('field')
            expect(e.errors[0]).toHaveProperty('message')

            expect(e.getByType('required') instanceof Array).toEqual(true)
            expect(e.getByField('id') instanceof Array).toEqual(true)
            expect(e.getByType('required')[0].field).toEqual('fieldname1.id')
            expect(e.getByField('id')[0].field).toEqual('fieldname1.id')
        }
    })


    it("should fail because of strict checks", function() {

        const defaultValue = {
            id: 32,
            name: 'abcde12345',
            status: true,
            nested: {
                id: 42,
                name: 'fghil67890',
                status: false,
                listing: [
                    'elm1',
                    'elm2'
                ]
            },
            extra: 'abc'
        }

        const dataField1 = new DataField({
            name:'fieldname1',
            schema: {
                type: 'object',
                props: {
                    id: { type: "number", positive: true, integer: true },
                    name: { type: "string", min: 3, max: 255 },
                    status: "boolean",
                    nested: {
                        type: 'object',
                        props: {
                            id: { type: "number", positive: true, integer: true },
                            name: { type: "string", min: 3, max: 255 },
                            status: "boolean",
                            listing: { type: "array" }
                        }
                    },
                    $$strict: true
                }
            }
        })

        expect(function() { dataField1.set(defaultValue) }).toThrow()
    })


    it("should manage relDirPath fields", function() {

        let dataField1 = null

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" },
                value: 423
            })
        }).toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" }
            })
        }).not.toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" }
            })
            df1.set(432)
        }).toThrow()


        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" },
                value: './test_dir'
            })
        }).not.toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath", exists: true },
                value: './test_dir'
            })
        }).not.toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath", exists: true },
                value: './test_dir-not'
            })
        }).toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath", exists: true },
                value: './test_dir/'
            })
        }).not.toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" },
                value: './test_dir/'
            })
        }).not.toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" },
                value: '/test_dir'
            })
        }).toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" },
                value: '/test_dir'
            })
        }).toThrow()

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "relDirPath" },
                value: 'test_dir'
            })
        }).toThrow()

    })
})
