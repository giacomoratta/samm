const { App, Cli } = require('./common')

const ProjectHistory = App.ProjectHistory

const commandName = 'project'

Cli.addCommand(`${commandName}`)

Cli.addCommandHeader(commandName)
  .description('Project manager (set a new project, show project history, etc.) \n')
  .option('-p, --path <path>', 'Set current project from its absolute path')
  .option('-h, --history [index]', 'Show all project history or set a new project by choosing one of them')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  const projectPath = cliInput.getOption('path')
  const historyIndex = cliInput.getOption('history')

  /* Set project by project path */
  if (projectPath) {
    try {
      ProjectHistory.add(projectPath)
      cliPrinter.info(`Current project: ${ProjectHistory.latest().path}`)
      ProjectHistory.save()
    } catch (e) {
      cliPrinter.error(e.message)
    }
    return cliNext()
  }

  /* Project History */
  const hIndex = parseInt(historyIndex)
  if (historyIndex === true || (!isNaN(hIndex) && hIndex > 0)) {
    const historyList = ProjectHistory.list()

    if (historyIndex === true) {
      /* List project history */
      if (historyList.length === 0) {
        cliPrinter.warn('Project history is empty.')
      } else {
        let i = 1
        cliPrinter.info('Project History\n')
        historyList.forEach((project) => {
          cliPrinter.info(` ${i.toString().padStart(historyList.length.toString().length, ' ')}) ${project.path}`)
          i++
        })
      }
      return cliNext()
    } else {
      /* Set project by history index */
      if (!historyList[hIndex - 1]) {
        cliPrinter.warn(`Wrong index; use a value between 1 and ${historyList.length}`)
      } else {
        try {
          ProjectHistory.add(historyList[hIndex - 1].path)
          cliPrinter.info(`Current project: ${ProjectHistory.latest().path}`)
          ProjectHistory.save()
        } catch (e) {
          cliPrinter.error(e.message)
        }
      }
      return cliNext()
    }
  }

  /* Show current project */
  if (ProjectHistory.latest()) {
    cliPrinter.info(`Current project: ${ProjectHistory.latest().path}`)
  }

  return cliNext()
})
