const { CliVorpal, CLI_SUCCESS, CLI_ERROR } = require('../../core/cli-vorpal/') /* leave final slash */
const log = require('../../core/logger').createLogger('ui')
const App = require('../../app/') /* leave final slash */
const Cli = new CliVorpal()

module.exports = {
  App,
  API: App.API,
  Cli,
  log,
  CLI_SUCCESS,
  CLI_ERROR
}
