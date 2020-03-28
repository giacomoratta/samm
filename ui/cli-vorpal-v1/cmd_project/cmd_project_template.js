const { API, Cli } = require('../ui_common')

const ProjectManager = API.projectManager
const ProjectHistory = API.projectHistory
const ProjectTemplate = API.projectTemplate

const commandName = 'project-template'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all templates or create a new project from one of them.\n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {

  /* Show project templates && !optTemplate */
  /* Create project from template */
  // return await optTemplateHandler({ ...sharedArgs })
})
