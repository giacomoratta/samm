const { API, Cli, CLI_CMD_ERR_FORMAT } = require('../ui_common')

const ProjectManager = API.projectManager
const ProjectHistory = API.projectHistory
const ProjectTemplate = API.projectTemplate

const commandName = 'project list'
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
    const pList = ProjectManager.listSiblings()
    if (pList.length > 0) {
      await cliPrompt({
        message: 'Set the current project',
        showFn: () => {
          cliPrinter.info(`Current project: ${currentProject}\n`)
          cliPrinter.info(`Projects in the same directory: ${currentProject.parentPath}`)
          cliPrinter.orderedList(pList, (pItem) => { return pItem.name })
        }
      }, async ({ exit, input }) => {
        if (exit === true) {
          cliNext()
          return true
        }

        let pIndex = parseInt(input)
        if (isNaN(pIndex) || pIndex < 1 || pIndex > pList.length) {
          cliPrinter.warn(`Invalid input: choose an index between 1 and ${pList.length}.`)
          return false
        }

        pIndex--
        if (ProjectManager.setCurrentProject(pList[pIndex]) === true) {
          cliPrinter.info(`New current project: ${pList[pIndex].path}.`)
          return true
        } else {
          cliPrinter.warn(`Project #${pIndex + 1} is not valid.`)
          return false
        }
      })
    } else {
      cliPrinter.warn('No projects in the parent directory.')
    }
  }
  return cliNext()
})
