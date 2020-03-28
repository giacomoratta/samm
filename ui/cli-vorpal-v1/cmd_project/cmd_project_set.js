const { API, Cli, CLI_CMD_ERR_FORMAT } = require('../ui_common')

const ProjectManager = API.projectManager
const ProjectHistory = API.projectHistory

const commandName = 'project set'
Cli.addCommand(commandName, '<path>')

Cli.addCommandHeader(commandName)
  .description('Set current project from its absolute path. \n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  /* Set project from path */
  // return await pamPathHandler({ ...sharedArgs })
})
