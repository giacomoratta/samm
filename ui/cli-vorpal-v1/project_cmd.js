const { App, Cli } = require('./common')

// const Config = App.Config

const commandName = 'project'

Cli.addCommand(`${commandName}`)

Cli.addCommandHeader(commandName)
  .description('Project manager (set a new project, show project history, etc.) \n')
  .option('-p, --path <path>', 'Set current project from its absolute path')
  .option('-h, --history [index]', 'Show all project history or set a new project by choosing one of them')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  return cliNext()
})
