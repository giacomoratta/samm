const path = require('path')
const { fileUtils } = require('../file.utils')

describe('Utils.File.singleton', function () {
  it('should create standard cross-os absolute paths', function () {
    const pathFile11Std = fileUtils.setAsAbsPath(path.join('file_utils_test_dir', 'directory1', 'file11.txt'), true)
    const pathFile11Local = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'file11.txt'), true)
    const pathDir2Std = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'))
    const pathDir2Local = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'))
    const pathFileCustomDir = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'file11.txt'), false, path.join(path.parse(__dirname).root, 'custom', 'dir'))
    const pathDirCustomDir = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'), false, path.join(path.parse(__dirname).root, 'custom', 'dir'))

    expect(pathFile11Std.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathFile11Local.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathDir2Std.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathDir2Local.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathFileCustomDir.startsWith(__dirname.substr(0, 8))).toEqual(false)
    expect(pathFileCustomDir.startsWith(path.join(path.parse(__dirname).root, 'custom', 'dir'))).toEqual(true)
    expect(pathDirCustomDir.startsWith(__dirname.substr(0, 8))).toEqual(false)
    expect(pathDirCustomDir.startsWith(path.join(path.parse(__dirname).root, 'custom', 'dir'))).toEqual(true)

    expect(pathFile11Std.startsWith(path.sep)).toEqual(true)
    expect(pathFile11Std.endsWith(path.sep)).toEqual(false)
    expect(pathFile11Local.startsWith(path.sep)).toEqual(true)
    expect(pathFile11Local.endsWith(path.sep)).toEqual(false)
    expect(pathDir2Std.startsWith(path.sep)).toEqual(true)
    expect(pathDir2Std.endsWith(path.sep)).toEqual(true)
    expect(pathDir2Local.startsWith(path.sep)).toEqual(true)
    expect(pathDir2Local.endsWith(path.sep)).toEqual(true)
    expect(pathFileCustomDir.startsWith(path.sep)).toEqual(true)
    expect(pathFileCustomDir.endsWith(path.sep)).toEqual(true)
    expect(pathDirCustomDir.startsWith(path.sep)).toEqual(true)
    expect(pathDirCustomDir.endsWith(path.sep)).toEqual(true)
  })

  it('should check, create and remove a file', async function () {
    const exists = await fileUtils.fileExists(path.join(__dirname, 'file_utils_test_dir'))
    expect(exists).toEqual(true)
  })

  it('should get unique file and directory names [sync]', function () {
    const parentPath = path.join(__dirname, 'file_utils_test_dir')

    expect(fileUtils.uniqueFileNameSync({
      parentPath,
      fileName: 'my_file1.txt'
    })).toEqual(path.join(parentPath, 'my_file1_1.txt'))

    expect(fileUtils.uniqueFileNameSync({
      parentPath,
      fileName: 'my_file7.txt'
    })).toEqual(path.join(parentPath, 'my_file7.txt'))

    expect(fileUtils.uniqueFileNameSync({
      parentPath,
      fileName: 'my_file.txt'
    })).toEqual(path.join(parentPath, 'my_file_4.txt'))

    expect(fileUtils.uniqueDirectoryNameSync({
      parentPath,
      directoryName: 'directoryB'
    })).toEqual(path.join(parentPath, 'directoryB_1'))

    expect(fileUtils.uniqueDirectoryNameSync({
      parentPath,
      directoryName: 'directoryC'
    })).toEqual(path.join(parentPath, 'directoryC'))

    expect(fileUtils.uniqueDirectoryNameSync({
      parentPath,
      directoryName: 'directoryA'
    })).toEqual(path.join(parentPath, 'directoryA_4'))
  })
})
