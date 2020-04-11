const { CliVorpal, CLI_CMD_OK, CLI_CMD_KO, CLI_CMD_ERR_FORMAT } = require('../../core/cli-vorpal/') /* leave final slash */
const log = require('../../app/logger').createLogger('ui')
const App = require('../../app/') /* leave final slash */
const Cli = new CliVorpal()

module.exports = {
  App,
  Cli,
  log,
  CLI_CMD_OK,
  CLI_CMD_KO,
  CLI_CMD_ERR_FORMAT,

  uiUtils: {
    sampleInlineInfo: function (sample) {
      return `[${sample.dir.length > 64 ? '...' : ''}${sample.dir.substr(-64)}]  ${sample.base}`
    },
    projectInlineInfo: function (project) {
      const date = new Date(project.modifiedAt)
      return `${project.name}  [${date.toUTCString()}]`
    }
  }
}
