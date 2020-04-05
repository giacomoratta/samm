const { App, Cli } = require('../ui_common')
const { ConfigAPI, SampleIndexAPI, SampleSetAPI, PathQueryAPI } = App

const commandName = 'search'

Cli.addCommand(commandName, '[query]')

Cli.addCommandHeader(commandName)
  .description('Search samples by query or show the latest search results. \n')
  .option('-l, --label <label>', 'Use a query label (see \'query\' command)')

Cli.addCommandBody(commandName, function ({ cliNext, cliInput, cliPrinter }) {
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
    const { sampleSet } = SampleSetAPI.create({ queryString: paramQueryString })
    if (!sampleSet || sampleSet.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleSet, cliPrinter)
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
    const { sampleSet } = SampleSetAPI.create({ pathQueryObj })
    if (!sampleSet || sampleSet.size === 0) {
      cliPrinter.warn('Samples not found!')
    } else {
      printSearchResults(sampleSet, cliPrinter)
    }
    return cliNext()
  }

  /* No options, no params */
  const { sampleSet } = SampleSetAPI.latest()
  if (!sampleSet || sampleSet.size === 0) {
    cliPrinter.warn('No samples found in the latest search!')
  } else {
    printSearchResults(sampleSet, cliPrinter)
  }
  return cliNext()
})

const printSearchResults = (sampleSet, cliPrinter) => {
  const printer = cliPrinter.child()
  let index = 1
  const length = sampleSet.size.toString().length
  sampleSet.forEach((sample) => {
    printer.info(`${(index++).toString().padStart(length, '0')}) ${sample.relPath}`)
  })
}
