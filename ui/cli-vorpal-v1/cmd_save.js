const path = require('path')
const { App, Cli } = require('./ui_common')

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

  // if (!destinationAbsPath || !destinationDirectory) {
  //   cliPrinter.error('Specify a directory name or an absolute path as destination!')
  //   return cliNext()
  // }

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

  let destinationPath = path.join(ProjectHistory.latest().path, 'mpl')
  let directoryName = null
  if (destinationDirectory) {
    directoryName = destinationDirectory
  } else if (destinationAbsPath) {
    destinationPath = destinationAbsPath
  }

  try {
    const result = await Export.generateSamplesDirectory({
      samplesArray,
      samplesQuery,
      destinationPath,
      directoryName,
      overwrite: overwriteDestination
    })

    let index

    cliPrinter.info(`Destination path for samples: ${destinationPath}`)
    cliPrinter.newLine()

    if (result.copiedFiles.length > 0) {
      cliPrinter.info(`Saved ${result.copiedFiles.length} samples:`)
      index = 1
      result.copiedFiles.forEach((samplePath) => {
        cliPrinter.info(` ${index.toString().padStart(result.copiedFiles.length.toString().length, ' ')}) ${samplePath}`)
        index++
      })

      if (result.notCopiedFiles.length > 0) {
        cliPrinter.newLine()
        cliPrinter.info(`...and ${result.notCopiedFiles.length} samples have not been saved:`)
        index = 1
        result.notCopiedFiles.forEach((samplePath) => {
          cliPrinter.info(` ${index.toString().padStart(result.notCopiedFiles.length.toString().length, ' ')}) ${samplePath}`)
          index++
        })
      }
    } else {
      cliPrinter.error('No samples have been saved!')
    }
  } catch (e) {
    cliPrinter.error(e.message)
    console.log(e)
    return cliNext()
  }

  return cliNext()
})
