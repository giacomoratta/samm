const { App, Cli } = require('./common')

// const Config = App.Config

const commandName = 'save'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Create a directory with the samples previously found; the directory name is set automatically with some keywords from the query.' + '\n')
  .option('-d, --dirname <dirname>', 'Save in a directory with a custom name')
  .option('-p, --path <path>', 'Absolute custom path')
  .option('-o, --overwrite', 'Overwrite the existent directory')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  return cliNext()
})
