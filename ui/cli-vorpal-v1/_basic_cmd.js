const { App, Cli, CLI_SUCCESS, CLI_ERROR } = require('./common')

const Config = App.Config

const commandName = 'abcde'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  return cliNext(CLI_SUCCESS)
})
