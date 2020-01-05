const { CliVorpal, CLI_SUCCESS, CLI_ERROR } = require('../../core/cli-vorpal/')
const App = require('../../app/')
const Cli = new CliVorpal()
const Config = App.Config

const printWarnings = () => {
  const messages = Config.statusMessages()
  if(messages.length === 0) return
  messages.forEach( (line) => {
    Cli.printer.newLine()
    Cli.printer.warn(`${line}`)
  })
  Cli.printer.newLine()
  //Cli.printer.boxed(messages,'WARNING')
}

Cli.on('show',printWarnings)
Cli.on('afterCommand',printWarnings)

// set logger

module.exports = {
  App,
  Cli,
  CLI_SUCCESS,
  CLI_ERROR
}
