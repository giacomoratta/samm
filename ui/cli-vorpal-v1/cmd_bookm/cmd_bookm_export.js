const { App, Cli } = require('../ui_common')
const { BookmarkAPI, ExportAPI, ProjectManagerAPI } = App

const commandName = 'bookm-export'

Cli.addCommand(commandName, '[label]')

Cli.addCommandHeader(commandName)
  .description('Export all bookmarks to current project or to a custom path. \n')
  .option('-p, --path', 'custom destination path.')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  if (!BookmarkAPI.hasBookmarks()) {
    cliPrinter.info('No bookmarks present.')
    return cliNext()
  }

  /* Setting destination path and parent name */
  let destinationPath = cliInput.getOption('path')
  let destinationParentName
  if (!destinationPath) {
    destinationPath = ProjectManagerAPI.getCurrentProject()
    if (!destinationPath) {
      cliPrinter.info('No current project set (use -p option or set a project).')
      return cliNext()
    }
  } else {
    destinationParentName = 'mpl-bookmarks'
  }

  /* Export a single label */
  const paramLabel = cliInput.getParam('label')
  if (paramLabel) {
    const bookmarkSet = BookmarkAPI.get(paramLabel)
    if (!bookmarkSet) {
      return cliNext() // no bookmark set!
    }
    const exportResults = await exportBookmarkSet({
      destinationPath,
      destinationParentName,
      bookmarkSet,
      bookmarkLabel: paramLabel,
      askConfirmation: true,
      cliPrompt,
      cliPrinter
    })
    printExportResults({ exportResults, destinationPath, cliPrinter })
    return cliNext()
  }

  /* Export all bookmarks */
  if (await askConfirmation({
    message: `Going to export ${BookmarkAPI.totalSamples()} bookmarked samples to ${destinationPath}`,
    cliPrinter,
    cliPrompt
  }) !== true) {
    return cliNext()
  }

  const bookmarkSets = BookmarkAPI.get()
  const bookmarkLabels = Object.keys(bookmarkSets)
  const exportResults = {
    failed: [],
    success: [],
    errors: []
  }
  let tmpExpRes
  for (let i = 0; i < bookmarkLabels.length; i++) {
    tmpExpRes = await exportBookmarkSet({
      destinationPath,
      destinationParentName,
      bookmarkSet: bookmarkSets[bookmarkLabels[i]],
      bookmarkLabel: bookmarkLabels[i],
      askConfirmation: false,
      cliPrompt,
      cliPrinter
    })
    exportResults.failed = exportResults.failed.concat(tmpExpRes.failed)
    exportResults.success = exportResults.success.concat(tmpExpRes.success)
    exportResults.errors = exportResults.errors.concat(tmpExpRes.errors)
  }
  printExportResults({ exportResults, destinationPath, cliPrinter })
  return cliNext()
})

const exportBookmarkSet = async ({
  destinationPath,
  destinationParentName,
  bookmarkSet,
  bookmarkLabel,
  askConfirmation = true,
  cliPrompt,
  cliPrinter
}) => {
  const exportPath = await ExportAPI.getExportPath({
    destinationPath,
    destinationParentName,
    destinationName: `${!destinationParentName ? 'bookmarks_' : 'bookm_'}${bookmarkLabel}`,
    overwrite: false
  })
  if (!exportPath) return

  if (askConfirmation === true && cliPrompt && await askConfirmation({
    message: `Going to export ${bookmarkSet.size} bookmarked samples to ${exportPath}`,
    cliPrinter,
    cliPrompt
  }) !== true) return

  return /* await */ ExportAPI.exportSampleSet({
    sampleSet: bookmarkSet,
    exportPath,
    overwrite: false
  })
}

const askConfirmation = async ({ message, cliPrinter, cliPrompt }) => {
  let wantToProceed = false
  await cliPrompt({
    message: 'Do you want to proceed? (y/n)',
    showFn: () => {
      cliPrinter.info(`${message}.\n`)
    }
  }, async ({ exit, input }) => {
    if (exit === true || input !== 'y') {
      return true
    }
    wantToProceed = true
    return true
  })
  return wantToProceed
}

const printExportResults = ({ exportResults, destinationPath, cliPrinter }) => {
  if (!exportResults) {
    cliPrinter.error('Something went wrong during the export process.')
  } else if (exportResults.failed.length > 0) {
    cliPrinter.error(`${exportResults.failed.length} bookmarks have not been exported successfully:`)
    cliPrinter.unorderedList(exportResults.failed)
    cliPrinter.newLine()
  } else if (exportResults.success.length > 0) {
    cliPrinter.error('All bookmarks exported successfully:')
  }
  cliPrinter.info(`> Destination path: ${destinationPath}`)
}
