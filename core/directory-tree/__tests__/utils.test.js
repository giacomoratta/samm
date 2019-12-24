const utils = require('../utils')

describe('Static utils for DirectoryTree', function () {
  it('should parse options correctly', function () {
    const options = {
      maxLevel: 5,
      includedExtensions: ['inc1', 'inc2', 'inc3'],
      excludedExtensions: ['exc1', 'exc2', 'exc3'],
      excludedPaths: ['excP1', 'excP2', 'excP3']
      // itemCb: function () {},
      // afterDirectoryCb: function () {}
    }
    const options2 = utils.parseOptions(options)

    options.includedExtensions = ['modInc1']
    options.maxLevel = 7
    options.itemCb = 'abc'

    expect(function () {
      options2.afterDirectoryCb()
    }).toThrow()
    expect(function () {
      options2.afterDirectoryCb({})
    }).not.toThrow()

    expect(options.maxLevel).toEqual(7)
    expect(options2.maxLevel).toEqual(5)
    expect(options.itemCb).toEqual('abc')
    expect(options.includedExtensions).toMatchObject(['modInc1'])
    expect(options2.includedExtensions).toMatchObject(['inc1', 'inc2', 'inc3'])
    expect(typeof options.itemCb === 'string').toEqual(true)
    expect(typeof options2.itemCb === 'function').toEqual(true)
  })

  // it('should handle strings', function () {
  //     let string1 = ''
  //     console.log(utils.prepareIncludedExtensions(options2.includedExtensions))
  // })
})
