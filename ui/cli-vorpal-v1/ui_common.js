const { CliVorpal, CLI_SUCCESS, CLI_ERROR } = require('../../core/cli-vorpal/')
const App = require('../../app/')
const Cli = new CliVorpal()

module.exports = {
  App,
  Cli,
  CLI_SUCCESS,
  CLI_ERROR
}
