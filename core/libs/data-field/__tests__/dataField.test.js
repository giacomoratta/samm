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
            value: defaultValue,
            strict: false
        })

        expect(dataField1.get()).toEqual(defaultValue)

        expect(function(){ dataField1.set({ invalid:'value' }) }).toThrow()

        const defaultValue1 = { ...defaultValue }
        defaultValue1.nested.listing = false
        expect(function(){ dataField1.set(defaultValue1) }).toThrow()

        try {
            dataField1.set({})
        } catch(e) {
            console.log(e.message)
        }

        // const defaultValue2 = { ...defaultValue }
        // console.log(defaultValue)
        // defaultValue1.nested.listing = [ 'abc' ]
        // defaultValue2.extraProp = 'text'
        // expect(function(){ dataField1.set(defaultValue2) }).not.toThrow()

    })
})
