const { App, Cli } = require('../ui_common')
const { ConfigAPI, SampleIndexAPI, SampleSetAPI } = App

const commandName = 'search'

Cli.addCommand(commandName, '[query]')

Cli.addCommandHeader(commandName)
  .description('Search samples by query or show the latest search results. \n')
  .option('-l, --label <label>', 'Use a query label (see \'query\' command)')

Cli.addCommandBody(commandName, function ({ cliNext, cliInput, cliPrinter }) {
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
    const sampleSet = SampleSetAPI.create({ queryString: paramQueryString })
    if (!sampleSet || sampleSet.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleSet, cliPrinter)
    }
    return cliNext()
  }

  /* OPTION: label */
  const optQueryLabel = cliInput.getParam('label')
  if (optQueryLabel) {
    cliPrinter.info(`Searching samples with label: ${optQueryLabel}`)
    const sampleSet = SampleSetAPI.create({ queryLabel: optQueryLabel })
    if (!sampleSet || sampleSet.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleSet, cliPrinter)
    }
    return cliNext()
  }

  /* No options, no params */
  const sampleSet = SampleSetAPI.latest()
  if (!sampleSet || sampleSet.size === 0) {
    cliPrinter.warn('No samples found in the latest search!')
  }
  return cliNext()

  // look: print latest lookup
  // look [query]: search, set and print latest lookup
  // look -l <label>: get path-query, search, set and print latest lookup
  // look -s: save latest lookup to project
  // look -s [custom-path]: save latest lookup to directory

  // search: print all samples
  // search [query]: search, set and print all samples
  // search -l <label>: get path-query, search, set and print latest lookup
})

const printSearchResults = (sampleSet, cliPrinter) => {
  const printer = cliPrinter.child()
  let index = 1
  sampleSet.forEach((sample) => {
    printer.info(`${index++} ${sample.relPath}`)
  })
}
