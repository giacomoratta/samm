const { API, Cli, CLI_CMD_ERR_FORMAT } = require('../ui_common')

const ProjectManager = API.projectManager
const ProjectHistory = API.projectHistory
const ProjectTemplate = API.projectTemplate

const commandName = 'project list'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all projects in the same parent directory or set the current project from of them. \n')
  .option('-d, --date', 'Order by date')
  .option('-n, --name', 'Order by name')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {

  /* List projects in the same directory */
  // return await pamListHandler({ ...sharedArgs })
})
