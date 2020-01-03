const { App, Cli, CLI_SUCCESS, CLI_ERROR } = require('./common')

// const Config = App.Config
const Samples = App.Samples

const commandName = 'scan'

Cli.addCommand(`${commandName}`)

Cli.addCommandHeader(commandName)
  .description('Perform a full scan of the samples directory and create the index. ' +
    'If the index is already present the scan does not start, in order to avoid resource wasting.' + '\n')
  .option('-f, --force', 'Force the rescan.')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  if (Samples.hasIndex() && cliInput.hasOption('force')) {
    cliPrinter.warn('Samples already indexed. Use -f to force a rescan.')
    return cliNext(CLI_SUCCESS)
  }

  cliPrinter.info('Indexing in progress...')
  const outcome = Samples.resetIndex()
  if (!Samples.resetIndex()) {
    cliPrinter.error('Indexing process failed!')
    return cliNext(CLI_ERROR)
  }

  cliPrinter.info('Indexing process completed successfully.')
  cliPrinter.info(`${Samples.size()} samples found`)
  return cliNext(CLI_SUCCESS)
})
