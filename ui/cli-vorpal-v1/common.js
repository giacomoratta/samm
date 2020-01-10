const { CliVorpal, CLI_SUCCESS, CLI_ERROR } = require('../../core/cli-vorpal/')
const { CliPrinter } = require('../../core/cli-vorpal/cliPrinter.class')
const App = require('../../app/')
const Cli = new CliVorpal()
const Config = App.Config

const ConfigErrors = Config.errors()
if (ConfigErrors.loadError) {
  const uiPrinter = new CliPrinter({ command: '' })
  uiPrinter.newLine()

  uiPrinter.error('Invalid configuration file')
  uiPrinter.error(` ${ConfigErrors.loadError.message}`)
  uiPrinter.info(`Configuration file path: ${Config.filePath}`)
  uiPrinter.newLine()
  uiPrinter.info('To solve the problem:')
  uiPrinter.info(' 1) delete manually the config file')
  uiPrinter.info(' 2) open the config file and fix the wrong values')
  uiPrinter.newLine()
  process.exit(1)
}

const ConfigStatusMessages = () => {
  const statusFlags = Config.get('Status')
  const statusMessages = []
  if (statusFlags['first-scan-needed'] === true) {
    statusMessages.push('First samples scan needed before start using the app')
  } else if (statusFlags['new-scan-needed'] === true) {
    statusMessages.push('New samples scan needed to keep using the app')
  }
  return statusMessages
}

const printWarnings = () => {
  const messages = ConfigStatusMessages()
  if (messages.length === 0) return
  messages.forEach((line) => {
    Cli.printer.newLine()
    Cli.printer.warn(`${line}`)
  })
  Cli.printer.newLine()
  // Cli.printer.boxed(messages,'WARNING')
}

Cli.on('show', printWarnings)
Cli.on('afterCommand', printWarnings)

// set logger

module.exports = {
  App,
  Cli,
  CLI_SUCCESS,
  CLI_ERROR
}
