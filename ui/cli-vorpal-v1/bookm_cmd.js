const { App, Cli } = require('./common')

// const Config = App.Config

const commandName = 'bookm'

Cli.addCommand(`${commandName} [label]`)

Cli.addCommandHeader(commandName)
  .description('Manage all bookmarks. It shows all the bookmarks by default, if no options are specified. \n')
  .option('-c, --copy <new-label>', 'Duplicate a bookmark label with the specified bookmark set \'new-label\'')
  .option('-i, --interactive', 'Run the command with an interactive interface to allow to add, move or remove bookmarks')
  .option('-l, --lookup', 'Shows the latest lookup')
  .option('-r, --remove', 'Remove a bookmark label if used with -t option, remove all bookmarks if used with -a option')
  .option('-s, --save', 'Save bookmarks in the current project')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  return cliNext()
})
