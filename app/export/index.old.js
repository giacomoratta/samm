const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')
const { SampleInfo } = require('../sample/sampleInfo.class')
const log = require('../logger').createLogger('export')

const generateSamplesDirectory = ({ samplesArray, samplesQuery, destinationPath, directoryName, overwrite }) => {
  if (!samplesArray || samplesArray.length === 0) {
    const error = new Error('Sample list not valid')
    log.error(error.message)
    throw error
  }
  if (!(samplesArray[0] instanceof SampleInfo)) {
    const error = new Error('Sample list should have SampleInfo instances only')
    log.error(error.message)
    throw error
  }

  if (!directoryName) directoryName = samplesQuery.label.substr(0, 16)
  if (directoryName.endsWith('_')) directoryName = directoryName.substr(0, directoryName.length - 1)

  if (overwrite === true && fileUtils.directoryExistsSync(path.join(destinationPath, directoryName))) {
    fileUtils.removeDirSync(path.join(destinationPath, directoryName))
  }

  const finalDirectoryPath = fileUtils.uniqueDirectoryNameSync({ parentPath: destinationPath, directoryName })
  if (!finalDirectoryPath) {
    const error = new Error('Cannot find a unique directory name as destination path')
    log.error(error.message)
    throw error
  }
  if (!fileUtils.ensureDirSync(destinationPath) || !fileUtils.ensureDirSync(finalDirectoryPath)) {
    const error = new Error(`Cannot create the destination path: ${finalDirectoryPath}`)
    log.error(error.message)
    throw error
  }

  const copyErrors = []
  const copiedFiles = []
  const notCopiedFiles = []
  const promisesArray = []
  let finalSamplePath
  log.info(`Exporting ${samplesArray.length} samples to ${finalDirectoryPath}...`)
  samplesArray.forEach((sample) => {
    finalSamplePath = (overwrite !== true ? fileUtils.uniqueFileNameSync({ parentPath: finalDirectoryPath, fileName: sample.base }) : path.join(finalDirectoryPath, sample.base))
    promisesArray.push(fileUtils.copyFile(sample.path, finalSamplePath, { overwrite }).then((result) => {
      copiedFiles.push(result.pathTo)
    }).catch((result) => {
      log.error('Copy failed', result)
      copyErrors.push(result.err)
      notCopiedFiles.push(result.pathTo)
    }))
  })
  return Promise.all(promisesArray).then(() => {
    log.info(`${copiedFiles.length} samples copied and ${notCopiedFiles.length} samples skipped`)
    return {
      copiedFiles,
      notCopiedFiles,
      destinationPath: finalDirectoryPath,
      copyErrors
    }
  })
}

module.exports = {
  Export: {
    generateSamplesDirectory
  }
}
