const { App, Cli } = require('./common')

const Config = App.Config
const Sample = App.Sample

const commandName = 'lookup'

Cli.addCommand(`${commandName} [query] `)

Cli.addCommandHeader(commandName)
  .description('Search samples by query or show the latest lookup. \n')
  .option('-a, --all', 'Show all samples that match the query (instead of the default random selection)')
  .option('-l, --label <label>', 'Use a query label (see \'query\' command)')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  const queryString = cliInput.getParam('query')
  const queryLabel = cliInput.getOption('label')

  /* Print latest lookup */
  if (!queryString && !queryLabel) {
    const lookupInfo = Sample.getLatestLookup()
    if (!lookupInfo) {
      cliPrinter.warn('Latest lookup is empty!')
    } else {
      printLookup(lookupInfo, cliPrinter)
    }
    return cliNext()
  }

  const options = {}
  if (queryLabel) options.queryLabel = queryLabel
  else if (queryString) options.queryString = queryString

  if (cliInput.hasOption('all')) {
    const sampleSetInfo = Sample.sampleSetByPathQuery(options)
    if (!sampleSetInfo || sampleSetInfo.sampleSet.size === 0) {
      cliPrinter.warn('No samples found!')
    } else {
      printSampleSet(sampleSetInfo, cliPrinter)
    }
    return cliNext()
  } else {
    const lookupInfo = Sample.lookupByPathQuery(options)
    if (!lookupInfo) {
      cliPrinter.warn('No samples found!')
    } else {
      printLookup(lookupInfo, cliPrinter)
    }
    return cliNext()
  }
})

const printLookup = (lookupInfo, cliPrinter) => {
  cliPrinter.info(`Lookup query: ${lookupInfo.query.queryString}`)
  cliPrinter.info(`Found samples: ${lookupInfo.sampleSet.size}`)
  cliPrinter.newLine()
  lookupInfo.lookup.forEach((sample, index) => {
    cliPrinter.info(`${index + 1}) ${sample.relPath}`)
  })
}

const printSampleSet = (sampleSetInfo, cliPrinter) => {
  cliPrinter.info(`Lookup query: ${sampleSetInfo.query.queryString}`)
  cliPrinter.newLine()
  sampleSetInfo.sampleSet.forEach((sample, index) => {
    cliPrinter.info(`${index + 1}) ${sample.relPath}`)
  })
}
