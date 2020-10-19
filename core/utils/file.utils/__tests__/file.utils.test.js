const path = require('path')
const { fileUtils } = require('../index')

describe('file.utils', function () {
  it('should create standard cross-os absolute paths', function () {
    const pathFile11Std = fileUtils.setAsAbsPath(path.join('file_utils_test_dir', 'directory1', 'file11.txt'), true)
    const pathFile11Local = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'file11.txt'), true)
    const pathDir2Std = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'))
    const pathDir2Local = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'))
    const pathFileCustomDir = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'file11.txt'), false, path.join(path.parse(__dirname).root, 'custom', 'dir'))
    const pathDirCustomDir = fileUtils.setAsAbsPath(path.join('.', 'file_utils_test_dir', 'directory1', 'directory2'), false, path.join(path.parse(__dirname).root, 'custom', 'dir'))

    expect(fileUtils.isAbsolutePath(__dirname)).toEqual(true)
    expect(fileUtils.isAbsolutePath(path.join('abc', 'fgh'))).toEqual(false)

    expect(pathFile11Std.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathFile11Local.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathDir2Std.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathDir2Local.startsWith(__dirname.substr(0, 16))).toEqual(true)
    expect(pathFileCustomDir.startsWith(__dirname.substr(0, 8))).toEqual(false)
    expect(pathFileCustomDir.startsWith(path.join(path.parse(__dirname).root, 'custom', 'dir'))).toEqual(true)
    expect(pathDirCustomDir.startsWith(__dirname.substr(0, 8))).toEqual(false)
    expect(pathDirCustomDir.startsWith(path.join(path.parse(__dirname).root, 'custom', 'dir'))).toEqual(true)

    expect(pathFile11Std.startsWith(path.parse(__dirname).root)).toEqual(true)
    expect(pathFile11Std.endsWith(path.sep)).toEqual(false)
    expect(pathFile11Local.startsWith(path.parse(__dirname).root)).toEqual(true)
    expect(pathFile11Local.endsWith(path.sep)).toEqual(false)
    expect(pathDir2Std.startsWith(path.parse(__dirname).root)).toEqual(true)
    expect(pathDir2Std.endsWith(path.sep)).toEqual(true)
    expect(pathDir2Local.startsWith(path.parse(__dirname).root)).toEqual(true)
    expect(pathDir2Local.endsWith(path.sep)).toEqual(true)
    expect(pathFileCustomDir.startsWith(path.parse(__dirname).root)).toEqual(true)
    expect(pathFileCustomDir.endsWith(path.sep)).toEqual(true)
    expect(pathDirCustomDir.startsWith(path.parse(__dirname).root)).toEqual(true)
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

  it('should manage json files with special characters', async function () {
    const file2SpecialCharsDefault = {
      prop1: 'test \u2502test test\u2510 test',
      prop2: 'ú ñ Ř'
    }
    const file2SpecialCharsDefault1 = {
      prop1: 'test │test test┐ test',
      prop2: 'ú ñ Ř'
    }

    let file2SpecialCharsContent, result
    const file2SpecialChars = path.join(__dirname, 'file_utils_test_dir', 'file_2_special_chars.json')

    result = fileUtils.writeJsonFileSync(file2SpecialChars, file2SpecialCharsDefault)
    expect(result).toEqual(true)
    file2SpecialCharsContent = fileUtils.readJsonFileSync(file2SpecialChars)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault1)

    result = fileUtils.writeJsonFileSync(file2SpecialChars, file2SpecialCharsContent)
    expect(result).toEqual(true)
    file2SpecialCharsContent = fileUtils.readJsonFileSync(file2SpecialChars)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault1)

    result = await fileUtils.writeJsonFile(file2SpecialChars, file2SpecialCharsDefault)
    expect(result).toEqual(true)
    file2SpecialCharsContent = await fileUtils.readJsonFile(file2SpecialChars)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault1)

    result = await fileUtils.writeJsonFile(file2SpecialChars, file2SpecialCharsContent)
    expect(result).toEqual(true)
    file2SpecialCharsContent = await fileUtils.readJsonFile(file2SpecialChars)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault)
    expect(file2SpecialCharsContent).toMatchObject(file2SpecialCharsDefault1)
  })
})
