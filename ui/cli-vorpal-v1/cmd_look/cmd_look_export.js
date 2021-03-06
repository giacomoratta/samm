const { App, Cli, uiUtils } = require('../ui_common')
const { SampleIndexAPI, SampleLookAPI, ProjectManagerAPI, ExportAPI } = App

const commandName = 'look-export'

Cli.addCommand(commandName, '[dirname]')

Cli.addCommandHeader(commandName)
  .description('Export the latest samples look in the current project; the optional parameter \'dirname\' is the name of destination directory\n')
  .option('-o, --overwrite', 'Overwrite the destination directory if exists')
  .option('-p, --path <custom-path>', 'Save latest lookup to current project directory or custom path')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  if (SampleIndexAPI.absent() === true) {
    cliPrinter.warn('No samples indexed (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }

  const { sampleLook, pathBasedQuery } = SampleLookAPI.latest()
  if (!sampleLook || sampleLook.size === 0) {
    cliPrinter.warn('No samples found in the latest look!')
  } else {
    printSearchResults(sampleLook, cliPrinter)
    cliPrinter.newLine()
    await saveSearchResults(sampleLook, pathBasedQuery, cliPrinter, cliInput, cliPrompt)
  }
  return cliNext()
})

const printSearchResults = (sampleSet, cliPrinter) => {
  const printer = cliPrinter.child()
  let index = 1
  const length = sampleSet.size.toString().length
  sampleSet.forEach((sample) => {
    printer.info(`  ${(index++).toString().padStart(length, '0')}) ${uiUtils.sampleInlineInfo(sample)}`)
  })
}

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
