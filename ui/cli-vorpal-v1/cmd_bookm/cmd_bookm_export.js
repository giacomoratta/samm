const { App, Cli } = require('../ui_common')
const { BookmarkAPI, ExportAPI } = App

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

  const bookmarkSet = {}

  const exportPath = await ExportAPI.getExportPath({
    destinationPath: '', // current project or custom
    destinationName: 'bookmarks-label',
    overwrite: false
  })

  await ExportAPI.exportSampleSet({
    sampleSet: bookmarkSet,
    exportPath,
    overwrite: false
  })

  return cliNext()
})
