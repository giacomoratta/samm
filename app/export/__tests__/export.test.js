const path = require('path')
process.env.ABSOLUTE_APP_PATH = path.resolve(path.join(__dirname, '..', '..', '__tests__'))
const { fileUtils } = require('./../../../core/utils/file.utils')

const { PathQuery } = require('../../path-query')
const { SampleSet } = require('../../sample/sampleSet.class')
const { SampleIndex } = require('../../sample/sampleIndex.class')
const { Export } = require('../index')

const samplesPath = path.join(process.env.ABSOLUTE_APP_PATH, 'test_dir')
const indexFilePath = path.join(__dirname, 'sample_index')

describe('Export functions', function () {
  it('Should generate samples directories', async function () {
    let result

    const sIndex1 = new SampleIndex({
      indexFilePath,
      samplesPath
    })

    await sIndex1.load()
    expect(sIndex1.size).toEqual(13)

    const samplesQuery = PathQuery.create('file6,file2')
    expect(samplesQuery).not.toEqual(null)

    const set1 = new SampleSet({
      validate: function (sample) {
        return sample.isFile === true && samplesQuery.check(sample.relPath)
      }
    })

    const samplesArray = []
    sIndex1.forEach(({ item }) => {
      if (set1.add(item) === true) {
        samplesArray.push(item)
      }
    })
    expect(set1.size).toEqual(6)
    expect(samplesArray.length).toEqual(6)

    const destinationPath = path.join(__dirname, 'mpl')
    fileUtils.removeDirSync(destinationPath)
    expect(fileUtils.directoryExistsSync(destinationPath)).toEqual(false)

    /* Tests start here... */

    let dirList

    result = await Export.generateSamplesDirectory({
      samplesArray,
      samplesQuery,
      destinationPath,
      overwrite: false
    })

    expect(result.copiedFiles).toBeInstanceOf(Array)
    expect(result.notCopiedFiles).toBeInstanceOf(Array)
    expect(result.copiedFiles.length).toEqual(6)
    expect(result.notCopiedFiles.length).toEqual(0)
    expect(fileUtils.directoryExistsSync(result.destinationPath)).toEqual(true)
    const basicDirName = path.parse(result.destinationPath).name

    result = await Export.generateSamplesDirectory({
      samplesArray,
      samplesQuery,
      destinationPath,
      overwrite: false
    })
    expect(fileUtils.directoryExistsSync(result.destinationPath)).toEqual(true)

    dirList = fileUtils.readDirectorySync(destinationPath)
    expect(dirList.length).toEqual(2)
    expect(dirList.indexOf(basicDirName) >= 0).toEqual(true)
    expect(dirList.indexOf(basicDirName + '_1') >= 0).toEqual(true)

    result = await Export.generateSamplesDirectory({
      samplesArray,
      samplesQuery,
      destinationPath,
      overwrite: false
    })
    expect(fileUtils.directoryExistsSync(result.destinationPath)).toEqual(true)

    result = await Export.generateSamplesDirectory({
      samplesArray,
      samplesQuery,
      destinationPath,
      overwrite: false
    })
    expect(fileUtils.directoryExistsSync(result.destinationPath)).toEqual(true)

    dirList = fileUtils.readDirectorySync(destinationPath)
    expect(dirList.length).toEqual(4)
    expect(dirList.indexOf(basicDirName) >= 0).toEqual(true)
    expect(dirList.indexOf(basicDirName + '_1') >= 0).toEqual(true)
    expect(dirList.indexOf(basicDirName + '_2') >= 0).toEqual(true)
    expect(dirList.indexOf(basicDirName + '_3') >= 0).toEqual(true)

    fileUtils.removeDirSync(path.join(destinationPath, basicDirName + '_1'))
    fileUtils.removeDirSync(path.join(destinationPath, basicDirName + '_2'))
    fileUtils.removeDirSync(path.join(destinationPath, basicDirName + '_3'))
    dirList = fileUtils.readDirectorySync(destinationPath)
    expect(dirList.length).toEqual(1)

    result = await Export.generateSamplesDirectory({
      samplesArray,
      samplesQuery,
      destinationPath,
      overwrite: true
    })
    expect(fileUtils.directoryExistsSync(result.destinationPath)).toEqual(true)
    expect(result.destinationPath).toEqual(path.join(destinationPath, basicDirName))
    dirList = fileUtils.readDirectorySync(destinationPath)
    expect(dirList.length).toEqual(1)

    fileUtils.removeDirSync(destinationPath)
  })
})
