const { API, Cli, CLI_CMD_ERR_FORMAT } = require('../ui_common')

const ProjectManager = API.projectManager

const commandName = 'project-list'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all projects in the same parent directory or set the current project from of them. \n')
  .option('-d, --date', 'order by date.')
  .option('-n, --name', 'order by name.')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const currentProject = ProjectManager.getCurrentProject()
  if (!currentProject) {
    cliPrinter.warn('No current project set: cannot show projects in the same directory.')
  } else {
    const projectSiblingsData = await currentProject.getSiblings()
    if (projectSiblingsData.siblings.length === 0) {
      cliPrinter.warn('No projects in the parent directory.')
    } else {
      await cliPrompt({
        message: 'Set the current project',
        showFn: () => {
          cliPrinter.info(`Current project: ${currentProject.path}\n`)
          cliPrinter.info(`Projects in the same directory: ${currentProject.parentPath}`)
          cliPrinter.orderedList(projectSiblingsData.siblings, (pItem) => { return pItem.name })
        }
      }, async ({ exit, input }) => {
        if (exit === true) {
          cliNext()
          return true
        }

        let pIndex = parseInt(input)
        if (isNaN(pIndex) || pIndex < 1 || pIndex > projectSiblingsData.siblings.length) {
          cliPrinter.warn(`Invalid input: choose an index between 1 and ${projectSiblingsData.siblings.length}.`)
          return false
        }

        pIndex--
        try {
          if (ProjectManager.setCurrentProject(projectSiblingsData.siblings[pIndex]) === true) {
            cliPrinter.info(`New current project: ${ProjectManager.getCurrentProject().path}.`)
            cliNext()
            return true
          } else {
            cliPrinter.warn(`Project #${pIndex + 1} is not valid.`)
            return false
          }
        } catch (e) {
          cliPrinter.error(`Project #${pIndex + 1} is not valid: ${e.message}`)
          return false
        }
      })
    }
  }
  return cliNext()
})
