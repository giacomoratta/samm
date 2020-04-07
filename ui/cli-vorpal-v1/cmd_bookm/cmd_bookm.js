const { App, Cli } = require('../ui_common')
const { BookmarkAPI } = App

const commandName = 'bookm'

Cli.addCommand(commandName, '[label]')

Cli.addCommandHeader(commandName)
  .description('Show or manage the bookmarks. \n')
  .option('-c, --copy <new-label>', 'copy the bookmarks in a new label or merge in an existent label.') // ask for confirmation
  .option('-l, --label <new-label>', 'change the label of a bookmark set') // ask for confirmation)
  .option('-r, --remove [...index]', 'remove an entire label or some bookmarks (by index)') // ask for confirmation)

Cli.addCommandBody(commandName, function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  if (!BookmarkAPI.hasBookmarks()) {
    cliPrinter.info('No bookmarks present.')
    return cliNext()
  }

  const mainLabel = cliInput.getParam('label')
  if ((!mainLabel && cliInput.hasOptions()) || !BookmarkAPI.has(mainLabel)) {
    cliPrinter.warn(`Management operations require an existing label. Invalid label: '${mainLabel || '-'}'.`)
  }

  if (cliInput.hasOption('copy')) {
    cliPrinter.info('Copying a set... (to-do)')
    return cliNext()
  }
  if (cliInput.hasOption('label')) {
    cliPrinter.info('Renaming the set... (to-do)')
    return cliNext()
  }
  if (cliInput.hasOption('remove')) {
    cliPrinter.info('Removing a set or bookmark... (to-do)')
    return cliNext()
  }

  const allBookmarks = BookmarkAPI.get()
  cliPrinter.info('Bookmarks list')
  cliPrinter.newLine()

  Object.keys(allBookmarks).forEach((key) => {
    cliPrinter.info(key)
    cliPrinter.orderedList(allBookmarks[key], (item) => { return item.relPath })
    cliPrinter.newLine()
  })

  return cliNext()
})
