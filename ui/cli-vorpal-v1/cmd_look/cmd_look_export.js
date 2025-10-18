const { App, Cli, uiUtils } = require('../ui_common')
const { saveSearchResults } = require('./saveSearchResults')
const { SampleIndexAPI, SampleLookAPI } = App

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
