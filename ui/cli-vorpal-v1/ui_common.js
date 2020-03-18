const { CliVorpal, CLI_SUCCESS, CLI_ERROR } = require('../../core/cli-vorpal')
const log = require('../../core/logger').createLogger('ui')
const App = require('../../app')
const Cli = new CliVorpal()

module.exports = {
  App,
  API: App.API,
  Cli,
  log,
  CLI_SUCCESS,
  CLI_ERROR
}
