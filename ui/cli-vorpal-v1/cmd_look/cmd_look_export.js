const { App, Cli } = require('../ui_common')
const { SampleIndexAPI, SampleLookAPI, ProjectManagerAPI, ExportAPI } = App
const SAMPLE_PATH_LENGTH = 98

const commandName = 'look-export'

Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Export the latest samples look in the current project or in a custom directory\n')
  .option('-d, --directory <name>', 'Directory name for the exported samples')
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
    await saveSearchResults(sampleLook, pathBasedQuery, cliPrinter, cliInput, cliPrompt)
  }
  return cliNext()
})

const printSearchResults = (sampleSet, cliPrinter) => {
  const printer = cliPrinter.child()
  let index = 1
  const length = sampleSet.size.toString().length
  sampleSet.forEach((sample) => {
    printer.info(`${(index++).toString().padStart(length, '0')}) ${sample.relPath.length > SAMPLE_PATH_LENGTH ? '...' : ''}${sample.relPath.substr(-SAMPLE_PATH_LENGTH)}`)
  })
}

const saveSearchResults = async (sampleSet, pathBasedQuery, cliPrinter, cliInput, cliPrompt) => {
  const optPath = cliInput.getOption('path')
  if (!optPath) return

  let destinationPath = optPath
  if (optPath === true) {
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
    destinationName: cliInput.getOption('directory') || destinationName,
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
