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
    const latestLookup = Sample.getLatestLookup()
    if (latestLookup.length === 0) {
      cliPrinter.warn('Latest lookup is empty!')
    } else {
      printLookup(latestLookup, Sample.getLatestLookupQuery(), cliPrinter)
    }
    return cliNext()
  }

  const options = {}
  if (queryLabel) options.queryLabel = queryLabel
  else if (queryString) options.queryString = queryString

  if (cliInput.hasOption('all')) {
    const sampleSet = Sample.sampleSetByPathQuery(options)
    if (!sampleSet || sampleSet.size === 0) {
      cliPrinter.warn('No samples found!')
    } else {
      printSampleSet(sampleSet, Sample.getLatestSampleSetQuery(), cliPrinter)
    }
    return cliNext()
  } else {
    const newLookup = Sample.lookupByPathQuery(options)
    if (newLookup.length === 0) {
      cliPrinter.warn('No samples found!')
    } else {
      printLookup(newLookup, Sample.getLatestLookupQuery(), cliPrinter)
    }
    return cliNext()
  }
})

const printLookup = (lookupArray, latestLookupQuery, cliPrinter) => {
  cliPrinter.info(`Lookup query: ${latestLookupQuery.queryString}`)
  cliPrinter.info(`Found samples: ${Sample.getLatestSampleSet().size}`)
  cliPrinter.newLine()
  lookupArray.forEach((sample, index) => {
    cliPrinter.info(`${index + 1}) ${sample.relPath}`)
  })
}

const printSampleSet = (sampleSet, latestSampleSetQuery, cliPrinter) => {
  cliPrinter.info(`Lookup query: ${latestSampleSetQuery.queryString}`)
  cliPrinter.newLine()
  sampleSet.forEach((sample, index) => {
    cliPrinter.info(`${index + 1}) ${sample.relPath}`)
  })
}
