const { FileButler } = require('../index')
const path = require('path')
const { fileUtils } = require('../../utils/file.utils')
const baseRoot = path.parse(__dirname).root

describe('FileButler actions with data and files', function () {
  it('should throw some errors because of missing or invalid options', function () {
    const newFileButler = function (options) { return new FileButler(options) }

    expect(function () { newFileButler() }).toThrow('Missing options')

    expect(function () { newFileButler({}) }).toThrow('Missing \'filePath\' option')

    expect(function () {
      newFileButler({
        filePath: path.join('invalid', 'path')
      })
    }).toThrow('\'filePath\' option must be an absolute path')

    expect(function () {
      newFileButler({
        filePath: path.join(baseRoot, 'dir_test', 'file1-not-exists.json')
      })
    }).toThrow('parent directory cannot be created')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1-not-exists.json')
      })
    }).not.toThrow('File specified in \'filePath\' cannot be created')
    expect(fileUtils.fileExistsSync(path.join(__dirname, 'dir_test', 'file1-not-exists.json'))).toEqual(true)
    fileUtils.removeFileSync(path.join(__dirname, 'dir_test', 'file1-not-exists.json'))

    expect(function () {
      const file1 = newFileButler({
        filePath: path.join(__dirname, 'new_parent_dir', 'new_dir', 'file123.txt'),
        fileType: 'text'
      })
      file1.set('test')
      file1.save()
    }).toThrow('parent directories do not exist')
    expect(fileUtils.directoryExistsSync(path.join(__dirname, 'new_parent_dir'))).toEqual(false)
    expect(fileUtils.directoryExistsSync(path.join(__dirname, 'new_parent_dir', 'new_dir'))).toEqual(false)

    expect(function () {
      const file1 = newFileButler({
        filePath: path.join(__dirname, 'new_dir', 'file123.txt'),
        fileType: 'text'
      })
      file1.set('test')
      file1.save()
    }).not.toThrow()
    expect(fileUtils.directoryExistsSync(path.join(__dirname, 'new_dir'))).toEqual(true)
    expect(fileUtils.fileExistsSync(path.join(__dirname, 'new_dir', 'file123.txt'))).toEqual(true)
    expect(fileUtils.removeDirSync(path.join(__dirname, 'new_dir'))).toEqual(true)

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1.json')
      })
    }).toThrow('\'fileType\' option must be present and have one')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1.json'),
        fileType: 'invalid-type'
      })
    }).toThrow('\'fileType\' option must be present and have one')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1.json'),
        fileType: 'json',
        cloneFrom: 'invalid/path'
      })
    }).toThrow('\'cloneFrom\' option must be an absolute path')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test', 'file1.clone-not-exists.json')
      })
    }).toThrow('Path specified in \'cloneFrom\' option does not exist')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1-new.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test', 'file1.clone-not-exists.json')
      })
    }).toThrow('Path specified in \'cloneFrom\' option does not exist')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1-new.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test', 'file1.clone.json')
      })
    }).not.toThrow('Path specified in \'cloneFrom\' option does not exist')

    expect(function () {
      newFileButler({
        filePath: path.join(__dirname, 'dir_test', 'file1-new.json'),
        fileType: 'json',
        cloneFrom: path.join(__dirname, 'dir_test', 'file1.clone.json'),
        backupTo: 'invalid/path'
      })
    }).toThrow('\'backupTo\' option must be an absolute path')

    const fb1 = newFileButler({
      filePath: path.join(__dirname, 'dir_test', 'file1-new.json'),
      fileType: 'json',
      cloneFrom: path.join(__dirname, 'dir_test', 'file1.clone.json')
    })
    expect(fileUtils.fileExistsSync(fb1.config.filePath)).toEqual(true)
    expect(fileUtils.readJsonFileSync(fb1.config.filePath)).toMatchObject({ abc: 123 })
    fileUtils.removeFileSync(fb1.config.filePath)

    const fb2 = newFileButler({
      filePath: path.join(__dirname, 'dir_test', 'file2-new.json'),
      fileType: 'json',
      backupTo: path.join(__dirname, 'dir_test', 'file1.backup.json')
    })
    fb2.set({ fgh: 756 })
    fb2.save()
    expect(fileUtils.fileExistsSync(fb2.config.backupTo)).toEqual(true)
    expect(fileUtils.readJsonFileSync(fb2.config.backupTo)).toMatchObject({ fgh: 756 })
    fileUtils.removeFileSync(fb2.config.filePath)
    fileUtils.removeFileSync(fb2.config.backupTo)
  })

  it('should use loadFn and saveFn', function () {
    class MyClass {
      constructor () {
        this.myData = {
          abc: 123,
          fgh: 654
        }
      }

      toFileContent () {
        return this.myData.wrap
      }

      setFromFile (d) {
        this.myData = { wrap: d }
      }
    }

    const mc1 = new MyClass()

    const fb1 = new FileButler({
      filePath: path.join(__dirname, 'dir_test', 'file33.json'),
      fileType: 'json',
      loadFn: function (data) {
        mc1.setFromFile(data)
        return mc1.myData
      },
      saveFn: function (data) {
        const c = mc1.toFileContent(data)
        expect(c).toMatchObject({ aaaaa: 432432 })
      }
    })
    expect(fb1.get()).toMatchObject({ wrap: { aaaaa: 432432 } })

    fb1.save()
    expect(fileUtils.readJsonFileSync(fb1.config.filePath)).toMatchObject({ aaaaa: 432432 })
  })

  it('should create a FileButler with correct options related to fileType = json', function () {
    const fb1 = new FileButler({
      filePath: path.join(__dirname, 'dir_test', 'file2.json'),
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
      filePath: path.join(__dirname, 'dir_test', 'file2.json'),
      fileType: 'json'
    })
    expect(fb2.get()).toMatchObject({ new: 'obj1' })
    fileUtils.removeFileSync(fb1.config.filePath)
  })

  it('should create a FileButler with correct options related to fileType = json-compact', function () {
    const fb1 = new FileButler({
      filePath: path.join(__dirname, 'dir_test', 'file2.compact.json'),
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
      filePath: path.join(__dirname, 'dir_test', 'file2.json'),
      fileType: 'json'
    })
    expect(fb2.get()).toEqual(null)
    fileUtils.removeFileSync(fb1.config.filePath)
    fileUtils.removeFileSync(fb2.config.filePath)
  })

  it('should create a FileButler with correct options related to fileType = string', function () {
    const fb1 = new FileButler({
      filePath: path.join(__dirname, 'dir_test', 'file2.txt'),
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
      filePath: path.join(__dirname, 'dir_test', 'file2_2.txt'),
      fileType: 'text'
    })
    expect(fb2.get()).toEqual('')
    fileUtils.removeFileSync(fb1.config.filePath)
    fileUtils.removeFileSync(fb2.config.filePath)
  })

  it('should make a deep copy of value', function () {
    const fb22 = new FileButler({
      filePath: path.join(__dirname, 'dir_test', 'file2.json'),
      fileType: 'json'
    })

    const x = { a: 1, b: { c: { d: 4 } } }
    fb22.set(x)

    x.b.c.d = 10
    expect(fb22.get()).toMatchObject({ a: 1, b: { c: { d: 4 } } })

    fileUtils.removeFileSync(fb22.config.filePath)
  })
})
