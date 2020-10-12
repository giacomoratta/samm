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

  if (overwrite === true && await fileUtils.directoryExists(exportPath) === true) {
    const removeDirResult = await fileUtils.removeDir(exportPath)
    log.warn({ result: removeDirResult, exportPath }, `Removed ${exportPath} before overwriting`)
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
  const copyFile = async (sample, exportPath, overwrite) => {
    let destSamplePath
    if (overwrite !== true) {
      try {
        destSamplePath = await fileUtils.uniqueFileName({
          parentPath: exportPath,
          fileName: sample.base
        })
      } catch (error) {
        exportResult.errors.push(error)
        exportResult.failed.push(sample.path)
      }
    } else {
      destSamplePath = path.join(exportPath, sample.base)
    }
    try {
      const result = await fileUtils.copyFile(sample.path, destSamplePath, { overwrite })
      exportResult.success.push(result.pathFrom)
    } catch (result) {
      exportResult.errors.push(result.err)
      exportResult.failed.push(result.pathFrom)
    }
  }

  sampleSet.forEach((sample) => {
    promisesArray.push(copyFile(sample, exportPath, overwrite))
  })

  await Promise.all(promisesArray)
  log.info(`${exportResult.success.length} samples copied and ${exportResult.failed.length} samples skipped.`)

  return exportResult
}

const getExportPath = async function ({
  destinationPath,
  destinationName,
  destinationParentName = 'samm',
  overwrite = false
}) {
  log.info({
    destinationPath,
    destinationName,
    destinationParentName,
    overwrite
  }, 'Get export path...')
  /* Add app signature (useful for multiple exports and to avoid confusion in file system) */
  destinationPath = path.join(destinationPath, destinationParentName || 'samm')

  let exportPath = path.join(destinationPath, destinationName)
  if (overwrite === true) {
    log.warn({ overwrite, exportPath }, 'Export path will be overwritten')
    return exportPath
  }

  exportPath = fileUtils.uniqueDirectoryNameSync({ parentPath: destinationPath, directoryName: destinationName })
  if (!exportPath) {
    log.error({ destinationPath, destinationName }, 'Cannot find a unique directory name as destination path')
    return
  }

  return exportPath
}

module.exports = {
  getExportPath,
  exportSampleSet
}
