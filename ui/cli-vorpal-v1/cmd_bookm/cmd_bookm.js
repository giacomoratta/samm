/**
 * bookm [label]: show entire list (if label, show single label list)
 *
 * -c <new-label>: copy bookmark set with the new label
 * -l <new-label>: rename label
 * -r [index...]: remove entire label or remove bookmark from a label by index (ask for confirmation)
 *
 * */
const { App, Cli } = require('../ui_common')
const { BookmarkAPI } = App

const commandName = 'bookm'

Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
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
  if (!allBookmarks) {
    cliPrinter.info('No bookmarks present.')
    return cliNext()
  }

  cliPrinter.info('Bookmarks list')
  cliPrinter.newLine()

  Object.keys(allBookmarks).forEach((key) => {
    cliPrinter.info(key)
    cliPrinter.orderedList(allBookmarks[key], (item) => { return item.relPath })
    cliPrinter.newLine()
  })

  return cliNext()
})
