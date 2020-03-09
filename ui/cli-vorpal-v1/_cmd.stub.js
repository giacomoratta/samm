// const { App, Cli } = require('./common')
const { Cli } = require('./ui_common')

// const Config = App.Config

const commandName = 'abcde'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  return cliNext()
})
