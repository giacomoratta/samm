const { App, Cli } = require('../ui_common')
const { ConfigAPI, SampleIndexAPI, SampleLookAPI, PathQueryAPI, ProjectManagerAPI, ExportAPI } = App

const commandName = 'look'

Cli.addCommand(commandName, '[query]')

Cli.addCommandHeader(commandName)
  .description('Search samples by query or show the latest sample look; ' +
    '(related configurations: LookRandomCount, LookRandomSameDirectory) \n')
  .option('-d, --directory <name>', 'Directory name for the exported samples')
  .option('-l, --label <label>', 'Use a query label (see \'query\' command)')
  .option('-o, --overwrite', 'Overwrite the destination directory if exists')
  .option('-s, --save [custom-path]', 'Save latest lookup to current project directory or custom path')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  if (ConfigAPI.field('SamplesDirectory').unset === true) {
    cliPrinter.warn('No samples directory set (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }
  if (SampleIndexAPI.absent() === true) {
    cliPrinter.warn('No samples indexed (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }
  if (SampleIndexAPI.empty() === true) {
    cliPrinter.warn('Sample index is empty (see \'config SamplesDirectory\' and use \'samples-scan\')')
    return cliNext()
  }

  /* PARAM: query */
  const paramQueryString = cliInput.getParam('query')
  if (paramQueryString) {
    cliPrinter.info(`Searching samples with query: ${paramQueryString}`)
    const { sampleLook, pathBasedQuery } = SampleLookAPI.create({ queryString: paramQueryString })
    if (!sampleLook || sampleLook.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleLook, cliPrinter)
      await saveSearchResults(sampleLook, pathBasedQuery, cliPrinter, cliInput, cliPrompt)
    }
    return cliNext()
  }

  /* OPTION: label */
  const optQueryLabel = cliInput.getOption('label')
  if (optQueryLabel) {
    cliPrinter.info(`Searching samples with label: ${optQueryLabel}`)
    const pathQueryObj = PathQueryAPI.get(optQueryLabel)
    if (!pathQueryObj) {
      cliPrinter.warn('Query not found!')
      return cliNext()
    }
    const { sampleLook, pathBasedQuery } = SampleLookAPI.create({ pathQueryObj })
    if (!sampleLook || sampleLook.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleLook, cliPrinter)
      await saveSearchResults(sampleLook, pathBasedQuery, cliPrinter, cliInput, cliPrompt)
    }
    return cliNext()
  }

  /* No options, no params */
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
    printer.info(`${(index++).toString().padStart(length, '0')}) ${sample.relPath.length > 36 ? '...' : ''}${sample.relPath.substr(-36)}`)
  })
}

const saveSearchResults = async (sampleSet, pathBasedQuery, cliPrinter, cliInput, cliPrompt) => {
  const optSave = cliInput.getOption('save')
  if (!optSave) return

  let destinationPath = optSave
  if (optSave === true) {
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
