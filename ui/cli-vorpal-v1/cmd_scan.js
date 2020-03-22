const { App, Cli } = require('./ui_common')

const Config = App.Config
const Sample = App.Sample

const commandName = 'scan'

Cli.addCommand(`${commandName}`)

Cli.addCommandHeader(commandName)
  .description('Perform a full scan of the samples directory and create the index;\n' +
    'if the index is already present the scan does not start, in order to avoid resource wasting.' + '\n')
  .option('-f, --force', 'Force the rescan')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  if (!Config.get('SamplesDirectory')) {
    cliPrinter.warn('No samples directory set; see \'config SamplesDirectory\' ')
    return cliNext()
  }
  if (Sample.hasIndex() && !cliInput.hasOption('force')) {
    cliPrinter.warn('Samples already indexed. Use -f to force a rescan.')
    return cliNext()
  }

  cliPrinter.info('Indexing in progress...')
  const outcome = await Sample.createIndex()
  if (!outcome) {
    cliPrinter.error('Indexing process failed!')
    return cliNext()
  }

  cliPrinter.info(`Indexing process completed successfully: ${Sample.indexSize()} samples found.`)
  return cliNext()
})
