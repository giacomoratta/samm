const { App, Cli } = require('../ui_common')
const { ProjectManagerAPI } = App

const commandName = 'project-list'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all projects in the same parent directory or set the current project from of them. \n')
  .option('-d, --date', 'order by date of latest change.')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const currentProject = ProjectManagerAPI.getCurrentProject()
  if (!currentProject) {
    cliPrinter.warn('No current project set: cannot show projects in the same directory.')
  } else {
    let orderBy = 'name'
    if (cliInput.hasOption('date') === true) orderBy = 'modifiedAt'
    const projectSiblingsData = await currentProject.getSiblings({ orderBy })

    if (projectSiblingsData.projects.length === 0) {
      cliPrinter.warn('No projects in the parent directory.')
    } else {
      cliPrinter.info(`Current project: ${currentProject.path}`)

      await cliPrompt({
        message: 'Select a project',
        showFn: () => {
          cliPrinter.info(`Projects in the same directory: ${currentProject.parentPath}`)
          cliPrinter.orderedList(projectSiblingsData.projects, (pItem) => {
            const date = new Date(pItem.modifiedAt)
            return `${pItem.path.length > 52 ? '...' : ''}${pItem.path.substr(-52)}  (${date.toUTCString()})`
          })
        }
      }, async ({ exit, input }) => {
        if (exit === true) return true

        let pIndex = parseInt(input)
        if (isNaN(pIndex) || pIndex < 1 || pIndex > projectSiblingsData.projects.length) {
          cliPrinter.warn(`Invalid input: choose an index between 1 and ${projectSiblingsData.projects.length}.`)
          return false
        }

        pIndex--
        try {
          const projectObj = projectSiblingsData.projects[pIndex]
          const setResult = await ProjectManagerAPI.setCurrentProject({ projectObj })
          if (setResult === true) {
            cliPrinter.info(`New current project: ${ProjectManagerAPI.getCurrentProject().path}`)
          } else {
            cliPrinter.error(`Project #${pIndex + 1} is not valid: ${projectObj.path}`)
            if (setResult.error) cliPrinter.error(`> reason: ${setResult.error.message}`)
          }
          return true
        } catch (e) {
          cliPrinter.error(`Project #${pIndex + 1} is not valid: ${e.message}`)
          return false
        }
      })
    }
  }
  return cliNext()
})
