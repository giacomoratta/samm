const { App, Cli } = require('../ui_common')
const { ConfigAPI, SampleIndexAPI } = App

const commandName = 'samples-scan'

Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Perform a full scan of the samples directory and create the index;\n' +
    'if the index is already present the scan does not start, in order to avoid resource wasting.' + '\n')
  .option('-f, --force', 'Force the rescan')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  if (!ConfigAPI.field('SamplesDirectory').value) {
    cliPrinter.warn('No samples directory set; use \'config SamplesDirectory\'.')
    return cliNext()
  }

  if (SampleIndexAPI.absent() !== true && SampleIndexAPI.empty() !== true && !cliInput.hasOption('force')) {
    cliPrinter.warn('Samples already indexed; use -f to force a rescan.')
    return cliNext()
  }

  cliPrinter.info('Indexing in progress...')
  if (await SampleIndexAPI.create() !== true) {
    cliPrinter.error('Indexing process has failed.')
    return cliNext()
  }

  cliPrinter.info(`Indexing process completed successfully: ${SampleIndexAPI.size()} samples found.`)
  return cliNext()
})
