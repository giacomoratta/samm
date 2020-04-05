const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')
const log = require('../logger').createLogger('exportSampleSet')

const exportSampleSet = async function ({
  sampleSet,
  exportPath,
  overwrite = false
}) {
  const exportResult = {
    failed: [],
    success: [],
    errors: []
  }

  log.info(`Exporting ${sampleSet.size} samples to ${exportPath}...`)

  const parentPath = path.parse(exportPath).dir
  let ensureDirResult = await fileUtils.ensureDir(parentPath)
  if (ensureDirResult !== true) {
    log.error({ parentPath, result: ensureDirResult }, 'Cannot create the parent path')
    exportResult.errors.push(ensureDirResult)
    return exportResult
  }

  ensureDirResult = await fileUtils.ensureDir(exportPath)
  if (ensureDirResult !== true) {
    log.error({ exportPath, result: ensureDirResult }, 'Cannot create the export path')
    exportResult.errors.push(ensureDirResult)
    return exportResult
  }

  const promisesArray = []
  const copyFile = (sourceSamplePath, destSamplePath, overwrite) => {
    promisesArray.push(fileUtils.copyFile(sourceSamplePath, destSamplePath, { overwrite }).then((result) => {
      exportResult.success.push(result.pathFrom)
    }).catch((result) => {
      // log.error({ result }, 'Copy failed')
      exportResult.errors.push(result.err)
      exportResult.failed.push(result.pathFrom)
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
        exportResult.errors.push(error)
        exportResult.failed.push(sample.path)
      })
    } else {
      copyFile(sample.path, path.join(exportPath, sample.base), overwrite)
    }
  })

  await Promise.all(promisesArray)
  log.info(`${exportResult.success.length} samples copied and ${exportResult.failed.length} samples skipped.`)

  return exportResult
}

const getSamplesExportPath = async function ({
  destinationPath,
  destinationName,
  overwrite = false
}) {
  /* Add app signature (useful for multiple exports and to avoid confusion in file system) */
  destinationPath = path.join(destinationPath, 'mpl')

  let exportPath = path.join(destinationPath, destinationName)
  if (overwrite === true && await fileUtils.directoryExists(exportPath) === true) {
    const removeDirResult = await fileUtils.removeDir(exportPath)
    log.warn({ result: removeDirResult, exportPath }, 'Remove before overwrite')
  }

  exportPath = fileUtils.uniqueDirectoryNameSync({ parentPath: destinationPath, directoryName: destinationName })
  if (!exportPath) {
    log.error({ destinationPath, destinationName }, 'Cannot find a unique directory name as destination path')
    return
  }

  return exportPath
}

module.exports = {
  getSamplesExportPath,
  exportSampleSet
}
