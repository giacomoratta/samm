const cliInput = require('../cliInput.class')


describe('cliInput class and object', function() {

    it("should throw errors for invalid arguments in constructor", function() {
        expect( function(){ new cliInput() } ).toThrowError('value')
        expect( function(){ new cliInput(null) } ).toThrowError('value')
        expect( function(){ new cliInput({}) } ).toThrowError('command')
        expect( function(){ new cliInput({},new String('mycommand')) } ).toThrowError('command')
        expect( function(){ new cliInput(new Object(),'mycommand') } ).not.toThrowError('value')
        expect( function(){ new cliInput({},'simple-command') } ).not.toThrow()
    })

    it("should create a simple cliInput", function() {
        const cliInput1 = new cliInput({}, 'cmd')

        expect(cliInput1.hasParam('param1')).toEqual(false)
        expect(cliInput1.hasOption('opt1')).toEqual(false)

        expect(cliInput1.getParam('param1')).toEqual(null)
        expect(cliInput1.getParam('param1')).not.toEqual(undefined)
        expect(cliInput1.getOption('opt1')).toEqual(null)
        expect(cliInput1.getOption('opt1')).not.toEqual(undefined)
        expect(function() { cliInput1.filterParams('invalid-function') } ).not.toThrow()
        expect(cliInput1.filterParams(() => { return 'abc' } )).toBeInstanceOf(Array)
        expect(cliInput1.filterParams(() => { return 'abc' } )).toHaveLength(0)
    })

    it("should create a complex cliInput", function() {
        const vorpalArgs1 = {
            options: { all: true, save: true, dirname: 'dir-abc-test' },
            reqA: 'qRA',
            reqB: 'wRB-dash',
            optA: 'eOA spaced',
            optB: 'rOB'
        }

        const cliInput1 = new cliInput(vorpalArgs1, 'cmd')
        expect(cliInput1.hasParam('reqA')).toEqual(true)
        expect(cliInput1.hasParam('reqB')).toEqual(true)
        expect(cliInput1.hasParam('optA')).toEqual(true)
        expect(cliInput1.hasParam('optB')).toEqual(true)
        expect(cliInput1.hasOption('reqA')).toEqual(false)
        expect(cliInput1.hasOption('reqB')).toEqual(false)
        expect(cliInput1.hasOption('optA')).toEqual(false)
        expect(cliInput1.hasOption('optB')).toEqual(false)


        expect(cliInput1.getParam('reqA')).toEqual(vorpalArgs1.reqA)
        expect(cliInput1.getParam('reqB')).toEqual(vorpalArgs1.reqB)
        expect(cliInput1.getParam('optA')).toEqual(vorpalArgs1.optA)
        expect(cliInput1.getParam('optB')).toEqual(vorpalArgs1.optB)
        expect(cliInput1.getParam('optB', (p) => { return p+'extra' })).toEqual(vorpalArgs1.optB+'extra')

        expect(cliInput1.getOption('all')).toEqual(vorpalArgs1.options.all)
        expect(cliInput1.getOption('save')).toEqual(vorpalArgs1.options.save)
        expect(cliInput1.getOption('dirname')).toEqual(vorpalArgs1.options.dirname)
        expect(cliInput1.getOption('dirname', (p) => { return p+'extra' })).toEqual(vorpalArgs1.options.dirname+'extra')

        expect(function() { cliInput1.filterParams('invalid-function') } ).toThrow()
        const filteredParams = cliInput1.filterParams((v) => {
            if(v.indexOf('RB')>0 || v.indexOf('OA')>0) return v+'_match'
        })
        expect(filteredParams).toBeInstanceOf(Array)
        expect(filteredParams).toHaveLength(2)
        expect(filteredParams).toMatchObject(['wRB-dash_match','eOA spaced_match'])
    })

})
