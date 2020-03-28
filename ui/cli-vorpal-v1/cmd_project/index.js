const { API, Cli } = require('../ui_common')

const ProjectManager = API.projectManager

const commandName = 'project'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Shows some information about the current project. \n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  /* Show current project */
  const currentProject = ProjectManager.getCurrentProject()
  if (currentProject) {
    cliPrinter.info(`Current project: ${currentProject.path}`)
  } else {
    cliPrinter.warn('No current project set.')
  }
  return cliNext()
})

require('./cmd_project_history')
require('./cmd_project_list')
require('./cmd_project_set')
require('./cmd_project_template')

const fs = require('fs')
const buffer1 = fs.readFileSync('./buffer1')
console.log(buffer1)
