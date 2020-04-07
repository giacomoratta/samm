/**
 *
 * bookm-look: add bookmarks from latest lookup (prompt, label, index)
 *               (prompt info: show all available labels)
 *
 * */

const { App, Cli } = require('../ui_common')
const { BookmarkAPI, SampleLookAPI } = App

const commandName = 'bookm-look'

Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const { sampleLook } = SampleLookAPI.latest()
  if (!sampleLook || sampleLook.size === 0) {
    cliPrinter.warn('No samples found in the latest look!')
    return cliNext()
  }

  const labelsArray = BookmarkAPI.labels()

  await cliPrompt({
    message: 'Add samples to bookmarks: [label] [indexes...]',
    showFn: () => {
      printSampleSet(sampleLook, cliPrinter)
      cliPrinter.newLine()
      printBookmarksLabels(labelsArray, cliPrinter)
    }

  }, async ({ exit, input }) => {
    if (exit === true) return true

    const parsed = parseInput(input, sampleLook.size, cliPrinter)
    if (!parsed) return false

    parsed.indexes.forEach((index) => {
      if (BookmarkAPI.add(parsed.label, sampleLook.get(index - 1).clone()) !== true) {
        cliPrinter.error(`Cannot add the sample #${index} to ${parsed.label}`)
      }
    })
  })
  return cliNext()
})

const parseInput = (input, maxIndex, cliPrinter) => {
  const parsedValues = {
    label: null,
    indexes: []
  }
  let params = input.split(' ')
  if (!BookmarkAPI.isLabelValid(params[0])) {
    return
  }
  if (params.length < 2) {
    return
  }
  parsedValues.label = params[0]
  params = params.splice(1)

  params.forEach((param) => {
    const index = parseInt(param)
    if (isNaN(index) || index < 1 || index > maxIndex) {
      return
    }
    parsedValues.indexes.push(index)
  })

  if (parsedValues.indexes.length === 0) {
    return
  }

  return parsedValues
}

const printSampleSet = (sampleSet, cliPrinter) => {
  // const printer = cliPrinter.child()
  let index = 1
  const length = sampleSet.size.toString().length
  sampleSet.forEach((sample) => {
    cliPrinter.info(`${(index++).toString().padStart(length, '0')}) ${sample.relPath}`)
  })
}

const printBookmarksLabels = (labelsArray, cliPrinter) => {
  if (labelsArray.length === 0) {
    cliPrinter.info('Available labels: no labels.')
    return
  }
  cliPrinter.info(`Available labels: ${labelsArray.join(',')}.`)
}
