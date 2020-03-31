const { API, Cli } = require('../ui_common')
const Config = API.config
const SampleIndex = API.sampleIndex

const commandName = 'samples-scan'

Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Perform a full scan of the samples directory and create the index;\n' +
    'if the index is already present the scan does not start, in order to avoid resource wasting.' + '\n')
  .option('-f, --force', 'Force the rescan')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  if (!Config.field('SamplesDirectory').value) {
    cliPrinter.warn('No samples directory set; use \'config SamplesDirectory\'.')
    return cliNext()
  }

  if (SampleIndex.has() && !cliInput.hasOption('force')) {
    cliPrinter.warn('Samples already indexed; use -f to force a rescan.')
    return cliNext()
  }

  cliPrinter.info('Indexing in progress...')
  if (await SampleIndex.create() !== true) {
    cliPrinter.error('Indexing process failed.')
    return cliNext()
  }

  cliPrinter.info(`Indexing process completed successfully: ${SampleIndex.size()} samples found.`)
  return cliNext()
})
