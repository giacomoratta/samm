const { CliVorpal, CLI_CMD_OK, CLI_CMD_KO, CLI_CMD_ERR_FORMAT } = require('../../core/cli-vorpal/') /* leave final slash */
const log = require('../../core/logger').createLogger('ui')
const App = require('../../app/') /* leave final slash */
const Cli = new CliVorpal()

module.exports = {
  App,
  API: App.API,
  Cli,
  log,
  CLI_CMD_OK,
  CLI_CMD_KO,
  CLI_CMD_ERR_FORMAT
}
