const path = require('path')
const { App, Cli } = require('./common')

const Sample = App.Sample
const ProjectHistory = App.ProjectHistory
const Export = App.Export

const commandName = 'save'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Create a directory with the samples in the latest lookup;\nthe directory name is set automatically with some keywords from the query.' + '\n')
  .option('-a, --all', 'Save all matched files instead of lookup random set')
  .option('-d, --dirname <dirname>', 'Save in a directory with a custom name')
  .option('-p, --path <path>', 'Absolute custom path')
  .option('-o, --overwrite', 'Overwrite the existent directory')

Cli.addCommandBody(commandName, async function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  const saveAll = cliInput.getOption('all')
  const destinationDirectory = cliInput.getOption('dirname')
  const destinationAbsPath = cliInput.getOption('path')
  const overwriteDestination = cliInput.getOption('overwrite')

  if (!ProjectHistory.latest()) {
    cliPrinter.error('Current project path is empty!')
    return cliNext()
  }

  if (!destinationAbsPath || !destinationDirectory) {
    cliPrinter.error('Specify a directory name or an absolute path as destination!')
    return cliNext()
  }

  if (destinationAbsPath && overwriteDestination === true) {
    cliPrinter.error('Operation not allowed: cannot overwrite a custom absolute path!')
    return cliNext()
  }

  let samplesArray, samplesQuery
  if (saveAll === true) {
    const sampleSetInfo = Sample.getLatestSampleSet()
    if (!sampleSetInfo) {
      cliPrinter.warn('Latest search is empty!')
      return
    }
    samplesArray = sampleSetInfo.sampleSet.toArray()
    samplesQuery = sampleSetInfo.query
  } else {
    const lookupInfo = Sample.getLatestLookup()
    if (!lookupInfo) {
      cliPrinter.warn('Latest lookup is empty!')
      return
    }
    samplesArray = lookupInfo.lookup
    samplesQuery = lookupInfo.query
  }

  let destinationPath = null
  if (destinationDirectory) {
    destinationPath = path.join(ProjectHistory.latest().path, 'mpl')
  } else if (destinationAbsPath) {
    destinationPath = destinationAbsPath
  }

  try {
    const result = await Export.generateSamplesDirectory({
      samplesArray,
      samplesQuery,
      destinationPath,
      overwrite: overwriteDestination
    })

    cliPrinter.info(`Saved ${samplesArray.length} samples in ${destinationPath}`)
    let i = 1
    samplesArray.forEach((sample) => {
      cliPrinter.info(` ${i.toString().padStart(samplesArray.length.toString().length, ' ')}) ${sample.path}`)
      i++
    })
  } catch (e) {
    cliPrinter.error(e.message)
    return cliNext()
  }

  return cliNext()
})
