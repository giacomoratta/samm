const { App, Cli } = require('../ui_common')
const { ProjectManagerAPI } = App

const commandName = 'project'
Cli.addCommand(commandName, '[path]')

Cli.addCommandHeader(commandName)
  .description('Shows some information about the current project or set current project from its absolute path. \n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const projectPath = cliInput.getParam('path')

  /* Set another current project */
  if (projectPath) {
    const setResult = await ProjectManagerAPI.setCurrentProject({ projectPath })
    if (setResult === true) {
      cliPrinter.info(`Current project: ${ProjectManagerAPI.getCurrentProject().path}`)
    } else {
      cliPrinter.error(`Cannot set this current path: ${projectPath}`)
      if (setResult.error) cliPrinter.error(`> reason: ${setResult.error.message}`)
    }
    return cliNext()
  }

  /* Show current project */
  const currentProject = ProjectManagerAPI.getCurrentProject()
  if (currentProject) {
    cliPrinter.info(`Current project: ${currentProject.path}`)
  } else {
    cliPrinter.warn('No current project set.')
  }
  return cliNext()
})
