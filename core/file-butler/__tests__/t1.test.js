const { FileButler } = require('../index')
const path = require('path')
const fileUtils = require('../../utils/file.utils')
// const fileBt1 = new FileButler()

/*
* load amd save 3 types
*
* set get
*
* callbacks + events (sync and async)
*
* */

describe('FileButler actions with data and files', function () {
  it('should throw some errors because of missing or invalid options', function () {
    const newFileButler = function (options) { return new FileButler(options) }

    expect(function () { newFileButler() }).toThrow('Missing options')

    expect(function () { newFileButler({}) }).toThrow('Missing \'filePath\' option')

    expect(function () {
      newFileButler({
        filePath: 'invalid/path'
      })
    }).toThrow('\'filePath\' option must be an absolute path')

    expect(function () {
      newFileButler({
        filePath: '/dir_test/file1-not-exists.json'
      })
    }).toThrow('File specified in \'filePath\' cannot be created')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1-not-exists.json')
      })
    }).not.toThrow('File specified in \'filePath\' cannot be created')
    expect(fileUtils.fileExistsSync(path.join(__dirname, 'dir_test/file1-not-exists.json'))).toEqual(true)
    fileUtils.removeFileSync(path.join(__dirname, 'dir_test/file1-not-exists.json'))

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1.json')
      })
    }).toThrow('\'fileType\' option must be present and have one')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1.json'),
        fileType: 'invalid-type'
      })
    }).toThrow('\'fileType\' option must be present and have one')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1.json'),
        fileType: 'json',
        cloneFrom: 'invalid/path'
      })
    }).toThrow('\'cloneFrom\' option must be an absolute path')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test/file1.clone-not-exists.json')
      })
    }).toThrow('Path specified in \'cloneFrom\' option does not exist')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1-new.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test/file1.clone-not-exists.json')
      })
    }).toThrow('Path specified in \'cloneFrom\' option does not exist')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1-new.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test/file1.clone.json')
      })
    }).not.toThrow('Path specified in \'cloneFrom\' option does not exist')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test/file1-new.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test/file1.clone.json'),
        backupTo: 'invalid/path'
      })
    }).toThrow('\'backupTo\' option must be an absolute path')
  })

  it('should create a FileButler with correct options related to fileType = json', function () {
    const fb1 = new FileButler({
      filePath: path.join(__dirname, 'dir_test/file2.json'),
      fileType: 'json'
    })
    expect(fb1.config.defaultValue).toEqual(null)
    expect(fb1.config.fn.validityCheck({ prop1: 'val' })).toEqual(true)
    expect(fb1.config.fn.validityCheck(123)).toEqual(false)
    expect(fb1.config.fn.validityCheck('abcde')).toEqual(false)
    expect(fb1.config.fn.validityCheck([1, 2, 3])).toEqual(false)

    expect(fb1.set({ new: 'obj1' })).toEqual(true)
    expect(fb1.set(123)).toEqual(false)
    expect(fb1.set('abcde')).toEqual(false)
    expect(fb1.set([1, 2, 3])).toEqual(false)
    expect(fb1.get()).toMatchObject({ new: 'obj1' })

    expect(fb1.save()).toEqual(true)
    expect(fileUtils.readJsonFileSync(fb1.config.filePath)).toMatchObject({ new: 'obj1' })

    const fb2 = new FileButler({
      filePath: path.join(__dirname, 'dir_test/file2.json'),
      fileType: 'json'
    })
    expect(fb2.get()).toMatchObject({ new: 'obj1' })
    fileUtils.removeFileSync(fb1.config.filePath)
  })

  it('should create a FileButler with correct options related to fileType = json-compact', function () {
    const fb1 = new FileButler({
      filePath: path.join(__dirname, 'dir_test/file2.compact.json'),
      fileType: 'json-compact'
    })
    expect(fb1.config.defaultValue).toEqual(null)
    expect(fb1.config.fn.validityCheck({ prop1: 'val' })).toEqual(true)
    expect(fb1.config.fn.validityCheck(123)).toEqual(false)
    expect(fb1.config.fn.validityCheck('abcde')).toEqual(false)
    expect(fb1.config.fn.validityCheck([1, 2, 3])).toEqual(false)

    expect(fb1.set({ new: 'obj1' })).toEqual(true)
    expect(fb1.set(123)).toEqual(false)
    expect(fb1.set('abcde')).toEqual(false)
    expect(fb1.set([1, 2, 3])).toEqual(false)
    expect(fb1.get()).toMatchObject({ new: 'obj1' })

    expect(fb1.save()).toEqual(true)
    expect(fileUtils.readJsonFileSync(fb1.config.filePath)).toMatchObject({ new: 'obj1' })

    const fb2 = new FileButler({
      filePath: path.join(__dirname, 'dir_test/file2.json'),
      fileType: 'json'
    })
    expect(fb2.get()).toEqual(null)
    fileUtils.removeFileSync(fb1.config.filePath)
    fileUtils.removeFileSync(fb2.config.filePath)
  })

  it('should create a FileButler with correct options related to fileType = string', function () {
    const fb1 = new FileButler({
      filePath: path.join(__dirname, 'dir_test/file2.txt'),
      fileType: 'text'
    })
    expect(fb1.config.defaultValue).toEqual('')
    expect(fb1.config.fn.validityCheck({ prop1: 'val' })).toEqual(false)
    expect(fb1.config.fn.validityCheck(123)).toEqual(false)
    expect(fb1.config.fn.validityCheck('abcde')).toEqual(true)
    expect(fb1.config.fn.validityCheck([1, 2, 3])).toEqual(false)

    expect(fb1.set('new-value')).toEqual(true)
    expect(fb1.set(123)).toEqual(false)
    expect(fb1.set({ new: 'obj1' })).toEqual(false)
    expect(fb1.set([1, 2, 3])).toEqual(false)
    expect(fb1.get()).toEqual('new-value')

    expect(fb1.save()).toEqual(true)
    expect(fileUtils.readTextFileSync(fb1.config.filePath)).toEqual('new-value')

    const fb2 = new FileButler({
      filePath: path.join(__dirname, 'dir_test/file2_2.txt'),
      fileType: 'text'
    })
    expect(fb2.get()).toEqual('')
    fileUtils.removeFileSync(fb1.config.filePath)
    fileUtils.removeFileSync(fb2.config.filePath)
  })
})
