const DataField = require('../index')

describe('dataField class and object', function() {

    it("should create an empty dataField", function() {

        const dataField1 = new DataField('array','object','mixed')

        const dataField2 = new DataField([
            {
                seconds: 'integer',
                meters: 'number',
                name: 'string',
                properties: {
                    color: 'string',
                    location: 'dirAbsPath',
                    file: 'fileRelPath',
                    subset: [
                        'char'
                    ]
                }
            }
        ])


    })

})
