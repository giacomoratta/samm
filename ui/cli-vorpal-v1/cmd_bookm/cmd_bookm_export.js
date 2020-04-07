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

  const paramLabel = cliInput.getParam('label')
  let destinationPath = cliInput.getOption('path')
  let destinationParentName

  if (!destinationPath) {
    destinationPath = ProjectManagerAPI.getCurrentProject()
    if (!destinationPath) {
      return // no current project!
    }
  } else {
    destinationParentName = 'mpl-bookmarks'
  }

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
    printExportResults(exportResults, cliPrinter)
    return cliNext()
  }

  // await prompt ... ask with destinationPath

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
  printExportResults(exportResults, cliPrinter)
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

  // if(askConfirmation === true) await... prompt continue?

  await ExportAPI.exportSampleSet({
    sampleSet: bookmarkSet,
    exportPath,
    overwrite: false
  })
}

const printExportResults = (exportResults, cliPrinter) => {

}
