const { App, Cli } = require('./ui_common')

const Sample = App.Sample

const commandName = 'lookup'

Cli.addCommand(`${commandName} [query] `)

Cli.addCommandHeader(commandName)
  .description('Search samples by query or show the latest lookup. \n')
  .option('-a, --all', 'Show all samples that match the query (instead of the default random selection)')
  .option('-l, --label <label>', 'Use a query label (see \'query\' command)')

Cli.addCommandBody(commandName, function ({ cliNext, cliInput, cliPrinter }) {
  const queryString = cliInput.getParam('query')
  const queryLabel = cliInput.getOption('label')

  /* Print latest lookup */
  if (!queryString && !queryLabel) {
    if (cliInput.hasOption('all')) {
      const sampleSetInfo = Sample.getLatestSampleSet()
      printSampleSet(sampleSetInfo, cliPrinter, 'Latest search is empty!')
    } else {
      const lookupInfo = Sample.getLatestLookup()
      printLookup(lookupInfo, cliPrinter, 'Latest search is empty!')
    }
    return cliNext()
  }

  const options = {}
  if (queryLabel) options.queryLabel = queryLabel
  else if (queryString) options.queryString = queryString

  if (cliInput.hasOption('all')) {
    const sampleSetInfo = Sample.sampleSetByPathQuery(options)
    printSampleSet(sampleSetInfo, cliPrinter, 'No samples found!')
    return cliNext()
  } else {
    const lookupInfo = Sample.lookupByPathQuery(options)
    printLookup(lookupInfo, cliPrinter, 'No samples found!')
    return cliNext()
  }
})

const printLookup = (lookupInfo, cliPrinter, emptyMessage) => {
  if (!lookupInfo) {
    cliPrinter.warn(emptyMessage)
    return
  }
  cliPrinter.info(`Lookup query: ${lookupInfo.query.queryString}`)
  cliPrinter.info(`Samples found: ${lookupInfo.sampleSet.size}`)
  cliPrinter.newLine()
  lookupInfo.lookup.forEach((sample, index) => {
    cliPrinter.info(`${index + 1}) ${sample.relPath}`)
  })
}

const printSampleSet = (sampleSetInfo, cliPrinter, emptyMessage) => {
  if (!sampleSetInfo) {
    cliPrinter.warn(emptyMessage)
    return
  }
  cliPrinter.info(`Lookup query: ${sampleSetInfo.query.queryString}`)
  cliPrinter.newLine()
  sampleSetInfo.sampleSet.forEach((sample, index) => {
    cliPrinter.info(`${index + 1}) ${sample.relPath}`)
  })
}
