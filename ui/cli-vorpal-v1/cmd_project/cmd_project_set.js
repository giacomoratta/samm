const { API, Cli } = require('../ui_common')

const ProjectManager = API.projectManager

// todo: merge to index with this command: project [path]

const commandName = 'project-set'
Cli.addCommand(commandName, '<path>')

Cli.addCommandHeader(commandName)
  .description('Set current project from its absolute path. \n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const projectPath = cliInput.getParam('path')
  const setResult = await ProjectManager.setCurrentProject({ projectPath })
  if (setResult === true) {
    cliPrinter.info(`Current project: ${ProjectManager.getCurrentProject().path}`)
  } else {
    cliPrinter.error(`Cannot set this current path: ${projectPath}`)
    if (setResult.error) cliPrinter.error(`> reason: ${setResult.error.message}`)
  }
  cliNext()
})
