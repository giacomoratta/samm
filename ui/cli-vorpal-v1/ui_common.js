const { CliVorpal, CLI_SUCCESS, CLI_ERROR } = require('../../core/cli-vorpal/')
const App = require('../../app/')
const Cli = new CliVorpal()

// const ConfigErrors = Config.errors()
// if (ConfigErrors.loadError) {
//   Cli.printer.newLine()
//
//   Cli.printer.error('Invalid configuration file')
//   Cli.printer.error(` ${ConfigErrors.loadError.message}`)
//   Cli.printer.info(`Configuration file path: ${Config.filePath}`)
//   Cli.printer.newLine()
//   Cli.printer.info('To solve the problem:')
//   Cli.printer.info(' 1) delete manually the config file')
//   Cli.printer.info(' 2) open the config file and fix the wrong values')
//   Cli.printer.newLine()
//   process.exit(1)
// }

module.exports = {
  App,
  Cli,
  CLI_SUCCESS,
  CLI_ERROR
}
