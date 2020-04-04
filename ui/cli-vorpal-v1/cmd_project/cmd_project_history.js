const { App, Cli } = require('../ui_common')
const { ProjectHistoryAPI, ProjectManagerAPI } = App

const commandName = 'project-history'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all project history or set the current project from one of them.\n')
  .option('-d, --date', 'order by date of latest change.')
  .option('-n, --name', 'order by name.')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  let orderBy = 'history'
  if (cliInput.hasOption('date') === true) orderBy = 'modifiedAt'
  else if (cliInput.hasOption('name') === true) orderBy = 'name'
  const projectHistoryList = await ProjectHistoryAPI.list({ orderBy })

  if (projectHistoryList.length === 0) {
    cliPrinter.warn('Project history is empty.')
  } else {
    const currentProject = ProjectManagerAPI.getCurrentProject()
    if (currentProject) cliPrinter.info(`Current project: ${currentProject.path}`)

    await cliPrompt({
      message: 'Select a project',
      showFn: () => {
        cliPrinter.orderedList(projectHistoryList, (pItem) => {
          const date = new Date(pItem.modifiedAt)
          return `${pItem.path.length > 36 ? '...' : ''}${pItem.path.substr(-36)}  (${date.toUTCString()})`
        })
      }
    }, async ({ exit, input }) => {
      if (exit === true) return true

      let pIndex = parseInt(input)
      if (isNaN(pIndex) || pIndex < 1 || pIndex > projectHistoryList.length) {
        cliPrinter.warn(`Invalid input: choose an index between 1 and ${projectHistoryList.length}.`)
        return false
      }

      pIndex--
      try {
        const projectObj = projectHistoryList[pIndex]
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
  return cliNext()
})
