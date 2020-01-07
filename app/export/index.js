const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')
const { SampleInfo } = require('../sample/sampleInfo.class')

// const { Config } = require('../config')

const generateSamplesDirectory = ({ samplesArray, samplesQuery, destinationPath, directoryName, overwrite }) => {
  if (!samplesArray || samplesArray.length === 0) {
    throw new Error('Sample list not valid')
  }
  if (!(samplesArray[0] instanceof SampleInfo)) {
    throw new Error('Sample list should have SampleInfo instances only')
  }

  if (!directoryName) directoryName = samplesQuery.label.substr(0, 16)
  if (directoryName.endsWith('_')) directoryName = directoryName.substr(0, directoryName.length - 1)

  if (overwrite === true && fileUtils.directoryExistsSync(path.join(destinationPath, directoryName))) {
    fileUtils.removeDirSync(path.join(destinationPath, directoryName))
  }

  const finalDirectoryPath = fileUtils.uniqueDirectoryNameSync({ parentPath: destinationPath, directoryName })
  if (!finalDirectoryPath) {
    throw new Error('Cannot find a unique directory name as destination path')
  }
  if (!fileUtils.ensureDirSync(destinationPath) || !fileUtils.ensureDirSync(finalDirectoryPath)) {
    throw new Error(`Cannot create the destination path: ${finalDirectoryPath}`)
  }

  const copiedFiles = []
  const notCopiedFiles = []
  const promisesArray = []
  let finalSamplePath
  samplesArray.forEach((sample) => {
    finalSamplePath = (overwrite !== true ? fileUtils.uniqueFileNameSync({ parentPath: finalDirectoryPath, fileName: sample.base }) : path.join(finalDirectoryPath, sample.base))
    promisesArray.push(fileUtils.copyFile(sample.path, finalSamplePath, { overwrite }).then((result) => {
      copiedFiles.push(result.pathTo)
    }).catch((result) => {
      notCopiedFiles.push(result.pathTo)
    }))
  })
  return Promise.all(promisesArray).then(() => {
    return {
      copiedFiles,
      notCopiedFiles,
      destinationPath: finalDirectoryPath
    }
  })
}

module.exports = {
  Export: {
    generateSamplesDirectory
  }
}
