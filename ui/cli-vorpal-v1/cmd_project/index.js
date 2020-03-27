const { API, Cli, CLI_CMD_ERR_FORMAT } = require('../ui_common')

const optCreateHandler = require('./opt_list')
const optHistoryHandler = require('./opt_list')
const optListHandler = require('./opt_list')
const optPathHandler = require('./opt_list')
const optTemplateHandler = require('./opt_list')

const ProjectManager = API.projectManager
const ProjectHistory = API.projectHistory
const ProjectTemplate = API.projectTemplate

const commandName = 'project'

Cli.addCommand(`${commandName} [operation]`)

Cli.addCommandHeader(commandName)
  .description('Project manager (set current project, project history, templates, etc.) \n')
  .option('-c, --create <name>', 'Create and set a project in the same parent directory of current project')
  .option('-l, --list [index]', 'Show all projects in the same parent directory or set one of them')
  .option('-p, --path <path>', 'Set current project from its absolute path')
  .option('-h, --history [index]', 'Show all project history or set the current project from one of them')
  .option('-t, --template [index]', 'Show all templates or create a new project from one of them')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const sharedArgs = { cliNext, cliPrinter, cliPrompt }
  const optCreate = cliInput.getOption('create')
  const optList = cliInput.getOption('list')
  const optHistory = cliInput.getOption('history')
  const optPath = cliInput.getOption('path')
  const optTemplate = cliInput.getOption('template')

  // todo: no operation and options => see history and current project
  // todo: operations: history, templates, list, set, create

  /* Show current project */
  if (!cliInput.hasParams && !cliInput.hasOptions) {
    const currentProject = ProjectManager.getCurrentProject()
    if (currentProject) {
      cliPrinter.info(`Current project: ${currentProject.path}`)
    } else {
      cliPrinter.warn('No current project set.')
    }
    return cliNext()
  }

  /* List projects in the same directory */
  if (cliInput.hasOption('list')) {
    return await optListHandler({ optList, ...sharedArgs })
  }

  /* Create a project in the same directory */
  if (cliInput.hasOption('create')) {
    return await optCreateHandler({ optCreate, ...sharedArgs })
  }

  /* Set or create project from path */
  if (cliInput.hasOption('path')) {
    return await optPathHandler({ optPath, ...sharedArgs })
  }

  /* Show project history !optHistory */
  /* Set project from history */
  if (cliInput.hasOption('history')) {
    return await optHistoryHandler({ optHistory, ...sharedArgs })
  }

  /* Show project templates && !optTemplate */
  /* Create project from template */
  if (cliInput.hasOption('template')) {
    return await optTemplateHandler({ optTemplate, ...sharedArgs })
  }

  return cliNext(CLI_CMD_ERR_FORMAT)

  // - - - - - - - - - - - - - - - -

  /* Set project by project path */
  if (optPath) {
    try {
      ProjectHistory.add(optPath)
      cliPrinter.info(`Current project: ${ProjectHistory.latest().path}`)
      ProjectHistory.save()
    } catch (e) {
      cliPrinter.error(e.message)
    }
    return cliNext()
  }

  /* Project History */
  const hIndex = parseInt(optHistory)
  if (optHistory === true || (!isNaN(hIndex) && hIndex > 0)) {
    const historyList = ProjectHistory.list()

    if (optHistory === true) {
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
