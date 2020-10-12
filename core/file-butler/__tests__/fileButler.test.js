const { FileButler } = require('../index.js')
const path = require('path')
const dirTestPath = path.join(__dirname, 'dir_test')

class TestFileButler extends FileButler { }

describe('FileButler constructor', function () {
  it('should not implement FileButler', function () {
    expect(function () {
      return new FileButler()
    }).toThrow('Cannot construct FileButler instances directly')
  })

  it('should have filePath option', function () {
    expect(function () {
      return new TestFileButler()
    }).toThrow('Missing \'filePath\' option.')
  })

  it('should have absolute path as filePath', function () {
    expect(function () {
      return new TestFileButler({
        filePath: 'abc'
      })
    }).toThrow('\'filePath\' option must be an absolute path')
  })

  it('should have a defined defaultValue', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: undefined
      })
    }).toThrow('Missing \'defaultValue\' option.')
  })

  it('should accept null as defaultValue', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: null
      })
    }).not.toThrow('Missing \'defaultValue\' option.')
  })

  it('should have validityCheck as function', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: ''
      })
    }).toThrow('\'validityCheck\' option is required and must be a function.')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: 123
      })
    }).toThrow('\'validityCheck\' option is required and must be a function.')
  })

  it('should have emptyCheck as function', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true }
      })
    }).toThrow('\'emptyCheck\' option is required and must be a function.')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: 123
      })
    }).toThrow('\'emptyCheck\' option is required and must be a function.')
  })

  it('should have fileToDataFn as function', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true }
      })
    }).toThrow('\'fileToDataFn\' option is required and must be a function.')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: 123
      })
    }).toThrow('\'fileToDataFn\' option is required and must be a function.')
  })

  it('should have dataToFileFn as function', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true }
      })
    }).toThrow('\'dataToFileFn\' option is required and must be a function.')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: 123
      })
    }).toThrow('\'dataToFileFn\' option is required and must be a function.')
  })

  it('should have cloneFrom as absolute path', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        cloneFrom: 'abc'
      })
    }).toThrow('\'cloneFrom\' option must be an absolute path')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        cloneFrom: path.join(dirTestPath, 'file22.example.raw')
      })
    }).not.toThrow('\'cloneFrom\' option must be an absolute path')
  })

  it('should have backupTo as absolute path', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        backupTo: 'abc'
      })
    }).toThrow('\'backupTo\' option must be an absolute path')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        backupTo: path.join(dirTestPath, 'file22.backup.raw')
      })
    }).not.toThrow('\'backupTo\' option must be an absolute path')
  })

  it('should have loadFn as function', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        loadFn: 123
      })
    }).toThrow('\'loadFn\' option must be a function.')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        loadFn: function (data) { return data }
      })
    }).not.toThrow('\'loadFn\' option must be a function.')
  })

  it('should have saveFn as function', function () {
    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        saveFn: 123
      })
    }).toThrow('\'saveFn\' option must be a function.')

    expect(function () {
      return new TestFileButler({
        filePath: path.join(dirTestPath, 'file22.raw'),
        defaultValue: '',
        validityCheck: function () { return true },
        emptyCheck: function () { return true },
        fileToDataFn: function () { return true },
        dataToFileFn: function () { return true },
        saveFn: function (data) { return data }
      })
    }).not.toThrow('\'saveFn\' option must be a function.')
  })
})
