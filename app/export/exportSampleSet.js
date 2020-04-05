const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')
const log = require('../logger').createLogger('exportSampleSet')

const _exportSamples = async function ({
  sampleSet,
  exportPath,
  overwrite = false
}) {
  log.info(`Exporting ${sampleSet.size} samples to ${exportPath}...`)

  const promisesArray = []
  const copiedFiles = []
  const notCopiedFiles = []
  const copyErrors = []

  const copyFile = (sourceSamplePath, destSamplePath, overwrite) => {
    promisesArray.push(fileUtils.copyFile(sourceSamplePath, destSamplePath, { overwrite }).then((result) => {
      copiedFiles.push(result.pathFrom)
    }).catch((result) => {
      // log.error({ result }, 'Copy failed')
      copyErrors.push(result.err)
      notCopiedFiles.push(result.pathFrom)
    }))
  }

  sampleSet.forEach((sample) => {
    if (overwrite !== true) {
      fileUtils.uniqueFileName({
        parentPath: exportPath,
        fileName: sample.base
      }).then((uniqueFilePath) => {
        copyFile(sample.path, uniqueFilePath, overwrite)
      }).catch((error) => {
        copyErrors.push(error)
        notCopiedFiles.push(sample.path)
      })
    } else {
      copyFile(sample.path, path.join(exportPath, sample.base), overwrite)
    }
  })

  await Promise.all(promisesArray)
  log.info(`${copiedFiles.length} samples copied and ${notCopiedFiles.length} samples skipped.`)

  return {
    copiedFiles,
    notCopiedFiles,
    copyErrors
  }
}

module.exports = async function ({
  sampleSet,
  destinationPath,
  destinationName,
  overwrite = false
}) {
  const exportResult = {
    exportPath: '',
    failed: [],
    success: []
  }

  /* Add app signature (useful for multiple exports and to avoid confusion in file system) */
  destinationPath = path.join(destinationPath, 'mpl')

  if (sampleSet.size === 0) {
    log.warn({ destinationPath, destinationName }, 'Sample set is empty')
    return exportResult
  }

  let exportPath = path.join(destinationPath, destinationName)
  if (overwrite === true && await fileUtils.directoryExists(exportPath) === true) {
    const removeDirResult = await fileUtils.removeDir(exportPath)
    log.warn({ result: removeDirResult, exportPath }, 'Remove before overwrite')
  }

  exportPath = fileUtils.uniqueDirectoryNameSync({ parentPath: destinationPath, directoryName: destinationName })
  if (!exportPath) {
    log.error({ destinationPath, destinationName }, 'Cannot find a unique directory name as destination path')
    return exportResult
  }

  let ensureDirResult = await fileUtils.ensureDir(destinationPath)
  if (ensureDirResult !== true) {
    log.error({ destinationPath, result: ensureDirResult }, 'Cannot create the destination path')
    return exportResult
  }

  ensureDirResult = await fileUtils.ensureDir(exportPath)
  if (ensureDirResult !== true) {
    log.error({ exportPath, result: ensureDirResult }, 'Cannot create the destination path')
    return exportResult
  }

  const finalOutcome = await _exportSamples({
    sampleSet,
    exportPath,
    overwrite
  })

  exportResult.failed = finalOutcome.notCopiedFiles
  exportResult.success = finalOutcome.copiedFiles
  exportResult.exportPath = exportPath
  return exportResult
}
