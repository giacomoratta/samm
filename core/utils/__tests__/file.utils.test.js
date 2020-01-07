const path = require('path')
const { fileUtils } = require('../file.utils')

describe('Utils.File.singleton', function () {
  it('should create standard cross-os absolute paths', function () {
    const path_file11_std = fileUtils.setAsAbsPath(path.join('file_utils_test_dir', 'directory1', 'file11.txt'), true)
    const path_file11_local = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'file11.txt'), true)
    const path_dir2_std = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'))
    const path_dir2_local = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'))
    const path_file_custom_dir = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'file11.txt'), false, path.join(path.parse(__dirname).root, 'custom', 'dir'))
    const path_dir_custom_dir = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'), false, path.join(path.parse(__dirname).root, 'custom', 'dir'))

    expect(path_file11_std.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(path_file11_local.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(path_dir2_std.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(path_dir2_local.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(path_file_custom_dir.startsWith(__dirname.substr(0, 8))).toEqual(false)
    expect(path_file_custom_dir.startsWith(path.join(path.parse(__dirname).root, 'custom', 'dir'))).toEqual(true)
    expect(path_dir_custom_dir.startsWith(__dirname.substr(0, 8))).toEqual(false)
    expect(path_dir_custom_dir.startsWith(path.join(path.parse(__dirname).root, 'custom', 'dir'))).toEqual(true)

    expect(path_file11_std.startsWith(path.sep)).toEqual(true)
    expect(path_file11_std.endsWith(path.sep)).toEqual(false)
    expect(path_file11_local.startsWith(path.sep)).toEqual(true)
    expect(path_file11_local.endsWith(path.sep)).toEqual(false)
    expect(path_dir2_std.startsWith(path.sep)).toEqual(true)
    expect(path_dir2_std.endsWith(path.sep)).toEqual(true)
    expect(path_dir2_local.startsWith(path.sep)).toEqual(true)
    expect(path_dir2_local.endsWith(path.sep)).toEqual(true)
    expect(path_file_custom_dir.startsWith(path.sep)).toEqual(true)
    expect(path_file_custom_dir.endsWith(path.sep)).toEqual(true)
    expect(path_dir_custom_dir.startsWith(path.sep)).toEqual(true)
    expect(path_dir_custom_dir.endsWith(path.sep)).toEqual(true)
  })

  it('should check, create and remove a file', async function () {
    const exists = await fileUtils.fileExists(path.join(__dirname, 'file_utils_test_dir'))
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
