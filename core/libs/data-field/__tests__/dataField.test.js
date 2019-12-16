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

    })
})
