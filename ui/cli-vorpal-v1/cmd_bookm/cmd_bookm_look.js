const { App, Cli } = require('../ui_common')
const { BookmarkAPI, SampleLookAPI } = App

const commandName = 'bookm-look'

Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Add bookmarks from latest lookup. \n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const { sampleLook } = SampleLookAPI.latest()
  if (!sampleLook || sampleLook.size === 0) {
    cliPrinter.warn('No samples found in the latest look!')
    return cliNext()
  }

  const labelsArray = BookmarkAPI.labels()
  let changesFlag = false

  await cliPrompt({
    message: `Add samples to bookmarks: [label] [indexes...${sampleLook.size > 2 ? `<1,${sampleLook.size}>` : '<1>'}]`,
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
        return
      }
      changesFlag = true
    })
    return false
  })

  if (changesFlag === true) {
    try {
      await BookmarkAPI.update()
      cliPrinter.info('Bookmarks collection updated successfully.')
    } catch (e) {
      cliPrinter.error(`Cannot update the bookmarks collection.\n> ${e.message}.`)
    }
  }
  return cliNext()
})

const parseInput = (input, maxIndex, cliPrinter) => {
  const parsedValues = {
    label: null,
    indexes: []
  }
  let params = input.split(' ')
  if (params.length < 2) {
    cliPrinter.warn('Invalid input: expected label and a list of numeric indexes.')
    return
  }
  if (!BookmarkAPI.isLabelValid(params[0])) {
    cliPrinter.warn(`Invalid label for a bookmark set: ${params[0]}.`)
    return
  }
  parsedValues.label = params[0]
  params = params.splice(1)

  params.forEach((param) => {
    const index = parseInt(param)
    if (isNaN(index) || index < 1 || index > maxIndex) return
    parsedValues.indexes.push(index)
  })

  if (parsedValues.indexes.length === 0) {
    cliPrinter.warn('Input has no valid indexes.')
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
