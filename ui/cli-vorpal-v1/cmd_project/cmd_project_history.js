const { API, Cli, CLI_CMD_ERR_FORMAT } = require('../ui_common')

const ProjectManager = API.projectManager
const ProjectHistory = API.projectHistory

const commandName = 'project-history'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all project history or set the current project from one of them.\n')
  .option('-d, --date', 'Order by date')
  .option('-n, --name', 'Order by name')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  /* Show project history !optHistory */
  /* Set project from history */
  // return await pamHistoryHandler({ ...sharedArgs })

  cliPrinter.warn('...to be implemented...')
  return cliNext(CLI_CMD_ERR_FORMAT)
})
