const CliInput = require('../cliInput.class')

describe('CliInput class and object', function () {
  it('should throw errors for invalid arguments in constructor', function () {
    expect(function () { new CliInput() }).toThrowError('value')
    expect(function () { new CliInput(null) }).toThrowError('value')
    expect(function () { new CliInput({}) }).toThrowError('command')
    expect(function () { new CliInput({}, new String('mycommand')) }).toThrowError('command')
    expect(function () { new CliInput(new Object(), 'mycommand') }).not.toThrowError('value')
    expect(function () { new CliInput({}, 'simple-command') }).not.toThrow()
  })

  it('should create a simple CliInput', function () {
    const CliInput1 = new CliInput({}, 'cmd')

    expect(CliInput1.hasParam('param1')).toEqual(false)
    expect(CliInput1.hasOption('opt1')).toEqual(false)

    expect(CliInput1.getParam('param1')).toEqual(null)
    expect(CliInput1.getParam('param1')).not.toEqual(undefined)
    expect(CliInput1.getOption('opt1')).toEqual(null)
    expect(CliInput1.getOption('opt1')).not.toEqual(undefined)
    expect(function () { CliInput1.filterParams('invalid-function') }).not.toThrow()
    expect(CliInput1.filterParams(() => { return 'abc' })).toBeInstanceOf(Array)
    expect(CliInput1.filterParams(() => { return 'abc' })).toHaveLength(0)
  })

  it('should create a complex CliInput', function () {
    const vorpalArgs1 = {
      options: { all: true, save: true, dirname: 'dir-abc-test' },
      reqA: 'qRA',
      reqB: 'wRB-dash',
      optA: 'eOA spaced',
      optB: 'rOB'
    }

    const CliInput1 = new CliInput(vorpalArgs1, 'cmd')
    expect(CliInput1.hasParam('reqA')).toEqual(true)
    expect(CliInput1.hasParam('reqB')).toEqual(true)
    expect(CliInput1.hasParam('optA')).toEqual(true)
    expect(CliInput1.hasParam('optB')).toEqual(true)
    expect(CliInput1.hasOption('reqA')).toEqual(false)
    expect(CliInput1.hasOption('reqB')).toEqual(false)
    expect(CliInput1.hasOption('optA')).toEqual(false)
    expect(CliInput1.hasOption('optB')).toEqual(false)

    expect(CliInput1.getParam('reqA')).toEqual(vorpalArgs1.reqA)
    expect(CliInput1.getParam('reqB')).toEqual(vorpalArgs1.reqB)
    expect(CliInput1.getParam('optA')).toEqual(vorpalArgs1.optA)
    expect(CliInput1.getParam('optB')).toEqual(vorpalArgs1.optB)
    expect(CliInput1.getParam('optB', (p) => { return p + 'extra' })).toEqual(vorpalArgs1.optB + 'extra')

    expect(CliInput1.getOption('all')).toEqual(vorpalArgs1.options.all)
    expect(CliInput1.getOption('save')).toEqual(vorpalArgs1.options.save)
    expect(CliInput1.getOption('dirname')).toEqual(vorpalArgs1.options.dirname)
    expect(CliInput1.getOption('dirname', (p) => { return p + 'extra' })).toEqual(vorpalArgs1.options.dirname + 'extra')

    expect(function () { CliInput1.filterParams('invalid-function') }).toThrow()
    const filteredParams = CliInput1.filterParams((v) => {
      if (v.indexOf('RB') > 0 || v.indexOf('OA') > 0) return v + '_match'
    })
    expect(filteredParams).toBeInstanceOf(Array)
    expect(filteredParams).toHaveLength(2)
    expect(filteredParams).toMatchObject(['wRB-dash_match', 'eOA spaced_match'])
  })
})
