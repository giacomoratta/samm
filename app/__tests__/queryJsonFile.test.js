process.env.ABSOLUTE_APP_PATH = __dirname
const { Config } = require('../config')
const { QueryJsonFile } = require('../query/queryJsonFile.class')
const { PathQuery } = require('../query/pathQuery.class')
const fileUtils = require('../../core/utils/file.utils')

describe('query endpoints', function () {
    it('should create and handle a query file', function () {

        // reset file
        fileUtils.writeJsonFileSync(Config.get('QueryFile'),{})

        const QueryFile1 = new QueryJsonFile(Config.get('QueryFile'))
        QueryFile1.load()
        expect(QueryFile1.QueryCollectionTemp).toMatchObject({})

        expect(QueryFile1.get('invalid_label1')).toEqual(undefined)
        expect(function () {
            QueryFile1.remove('invalid_label1')
        }).not.toThrow()

        expect(QueryFile1.add({
            label: 'my_label_11',
            queryString: ',+ +,+, '
        })).toEqual(false)

        expect(QueryFile1.add({
            label: 'my_label_11',
            queryString: 'le61+file1,+fi le3,+, '
        })).toEqual(true)

        const pathQuery11 = QueryFile1.get('my_label_11')
        expect(pathQuery11.label).toEqual('my_label_11')
        expect(pathQuery11.queryString).toEqual('le61+file1,file3')
        expect(pathQuery11.check('/drd/file3/dsf')).toEqual(true)
        expect(pathQuery11.check('/drd/file/dsf')).toEqual(false)
        expect(pathQuery11.check('/drd/file1/dle61sf')).toEqual(true)
        expect(pathQuery11.check('/drd/file1/dled61sf')).toEqual(false)


        expect(QueryFile1.has('my_label_11')).toEqual(true)
        expect(QueryFile1.has('my_label_12')).toEqual(false)

        QueryFile1.remove('my_label_11')
        expect(QueryFile1.get('my_label_11')).toEqual(undefined)
        expect(QueryFile1.has('my_label_11')).toEqual(false)


        expect(QueryFile1.add({
            label: 'my_label_21',
            queryString: 'le61+file1,+fi le3,+, '
        })).toEqual(true)


        expect(QueryFile1.add({
            label: 'my_label_31',
            queryString: 'le61+file1,+fi le3,+, '
        })).toEqual(true)

        expect(QueryFile1.add({
            label: 'my_label_41',
            queryString: 'le61+file1,+fi le3,+, '
        })).toEqual(true)

        QueryFile1.forEach((pathQuery) => {
            expect(pathQuery.queryString).toEqual('le61+file1,file3')
            expect(pathQuery.check('/drd/file3/dsf')).toEqual(true)
            expect(pathQuery.check('/drd/file/dsf')).toEqual(false)
            expect(pathQuery.check('/drd/file1/dle61sf')).toEqual(true)
            expect(pathQuery.check('/drd/file1/dled61sf')).toEqual(false)
        })

        QueryFile1.save()

        const qf1Json = fileUtils.readJsonFileSync(Config.get('QueryFile'))
        expect(qf1Json['QueryCollection'].length).toEqual(3)
        expect(qf1Json['QueryCollection'][2].queryString).toEqual('le61+file1,file3')

        const QueryFile2 = new QueryJsonFile(Config.get('QueryFile'))
        QueryFile2.load()

        expect(QueryFile2.get('my_label_21')).toBeInstanceOf(PathQuery)
        expect(QueryFile2.get('my_label_31')).toBeInstanceOf(PathQuery)
        expect(QueryFile2.get('my_label_41')).toBeInstanceOf(PathQuery)

        QueryFile2.forEach((pathQuery) => {
            expect(pathQuery.queryString).toEqual('le61+file1,file3')
            expect(pathQuery.check('/drd/file3/dsf')).toEqual(true)
            expect(pathQuery.check('/drd/file/dsf')).toEqual(false)
            expect(pathQuery.check('/drd/file1/dle61sf')).toEqual(true)
            expect(pathQuery.check('/drd/file1/dled61sf')).toEqual(false)
        })

        expect(QueryFile2.has('my_label_21')).toEqual(true)
        expect(QueryFile2.has('my_label_31')).toEqual(true)
        expect(QueryFile2.has('my_label_41')).toEqual(true)

        QueryFile2.remove('my_label_21')
        QueryFile2.remove('my_label_31')
        QueryFile2.remove('my_label_41')

        expect(QueryFile2.has('my_label_21')).toEqual(false)
        expect(QueryFile2.has('my_label_31')).toEqual(false)
        expect(QueryFile2.has('my_label_41')).toEqual(false)

        QueryFile2.save()

        expect(fileUtils.readJsonFileSync(Config.get('QueryFile'))).toMatchObject({
            "QueryCollection": []
        })
    })
})
