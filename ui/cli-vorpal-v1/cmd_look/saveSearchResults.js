const { App } = require('../ui_common')
const { ProjectManagerAPI, ExportAPI } = App

const saveSearchResults = async (sampleSet, pathBasedQuery, cliPrinter, cliInput, cliPrompt) => {
  let destinationPath
  if (cliInput.hasOption('path')) {
    destinationPath = cliInput.getOption('path')
  } else {
    if (!ProjectManagerAPI.getCurrentProject()) {
      cliPrinter.error('No current project set: cannot export samples.')
      return
    }
    destinationPath = ProjectManagerAPI.getCurrentProject().path
  }

  let destinationName = pathBasedQuery.label.substr(0, 16)
  if (destinationName.endsWith('_')) destinationName = destinationName.substr(0, destinationName.length - 1)

  const exportPath = await ExportAPI.getExportPath({
    destinationPath,
    destinationName: cliInput.getParam('dirname') || destinationName,
    overwrite: !!cliInput.getOption('overwrite')
  })

  let wantToProceed = false

  if (cliPrompt) {
    await cliPrompt({
      message: 'Do you want to proceed? (y/n)',
      showFn: () => {
        cliPrinter.info(`Going to export ${sampleSet.size} samples to ${exportPath} .\n`)
      }
    }, async ({ exit, input }) => {
      if (exit === true || input !== 'y') {
        return true
      }
      wantToProceed = true
      return true
    })
  } else {
    wantToProceed = true
  }

  if (!wantToProceed) return

  const expResult = await ExportAPI.exportSampleSet({
    sampleSet,
    exportPath,
    overwrite: !!cliInput.getOption('overwrite')
  })

  if (expResult.success.length === 0) {
    cliPrinter.info(`No samples exported to ${exportPath}.`)
  } else if (expResult.failed.length === 0) {
    cliPrinter.info(`${expResult.success.length}/${sampleSet.size} samples exported successfully to ${exportPath}.`)
  } else {
    cliPrinter.info(`${sampleSet.size} samples not exported:`)
    cliPrinter.orderedList(expResult.failed)
    cliPrinter.newLine()
    cliPrinter.info(`${expResult.success.length}/${sampleSet.size} samples exported successfully to ${exportPath}.`)
  }
}

module.exports = {
  saveSearchResults
}
