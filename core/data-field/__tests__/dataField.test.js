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


    it("should manage absDirPath fields", function() {

        const fileUtils = require('../../utils/file.utils')
        const path = require('path')
        const basePath = __dirname + path.sep

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absDirPath", checkExists: false, createIfNotExists: false, deleteIfExists: false },
                value:  './abc/file_utils_test_dirx'
            })
        }).toThrow('notAbsDirPath')

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absDirPath", checkExists: true, createIfNotExists: false, deleteIfExists: false },
                value:  basePath + 'file_utils_test_dirx'
            })
        }).toThrow('dirNotExists')

        expect(function(){
            fileUtils.copyDirectorySync(basePath + 'file_utils_test_dir',basePath + 'file_utils_test_dir2')
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absDirPath", checkExists: false, createIfNotExists: false, deleteIfExists: true },
                value:  basePath + 'file_utils_test_dir2'
            })
        }).not.toThrow()
        expect(fileUtils.directoryExistsSync(basePath + 'file_utils_test_dir2')).toEqual(false)

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absDirPath", checkExists: false, createIfNotExists: true, deleteIfExists: true },
                value:  basePath + 'file_utils_test_dir3'
            })
        }).not.toThrow()
        expect(fileUtils.directoryExistsSync(basePath + 'file_utils_test_dir3')).toEqual(true)
        expect(fileUtils.removeDirSync(basePath + 'file_utils_test_dir3')).toEqual(true)

    })


    it("should manage absFilePath fields", function() {

        const fileUtils = require('../../utils/file.utils')
        const path = require('path')
        const basePath = __dirname + path.sep

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absFilePath", checkExists: false, createIfNotExists: false, deleteIfExists: false },
                value:  './abc/file_utils_test_dir/file1.json'
            })
        }).toThrow('notAbsFilePath')

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absFilePath", checkExists: true, createIfNotExists: false, deleteIfExists: false },
                value:  basePath + 'file_utils_test_dir/file1.jsonx'
            })
        }).toThrow('fileNotExists')

        expect(function(){
            fileUtils.copyFileSync(basePath + 'file_utils_test_dir/file1.json',basePath + 'file_utils_test_dir/file1_2.json')
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absFilePath", checkExists: false, createIfNotExists: false, deleteIfExists: true },
                value:  basePath + 'file_utils_test_dir/file1_2.json'
            })
        }).not.toThrow()
        expect(fileUtils.fileExistsSync(basePath + 'file_utils_test_dir/file1_2.json')).toEqual(false)

        expect(function(){
            const df1 = new DataField({
                name:'fieldname1',
                schema: { type: "absFilePath", checkExists: false, createIfNotExists: true, deleteIfExists: true },
                value:  basePath + 'file_utils_test_dir/file1_3.json'
            })
        }).not.toThrow()
        expect(fileUtils.fileExistsSync(basePath + 'file_utils_test_dir/file1_3.json')).toEqual(true)
        expect(fileUtils.removeFileSync(basePath + 'file_utils_test_dir/file1_3.json')).toEqual(true)

    })
})
