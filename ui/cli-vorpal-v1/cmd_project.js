const { App, Cli } = require('./ui_common')

const Project = App.project
const ProjectHistory = App.projectHistory
const ProjectTemplate = App.projectTemplate

const commandName = 'project'

Cli.addCommand(`${commandName}`)

Cli.addCommandHeader(commandName)
  .description('Project manager (set current project, project history, templates, etc.) \n')
  .option('-c, --create <name>', 'Create and set a project in the same parent directory of current project')
  .option('-l, --list [index]', 'Show all projects in the same parent directory or set one of them')
  .option('-p, --path <path>', 'Set or create current project from its absolute path')
  .option('-h, --history [index]', 'Show all project history or set the current project from one of them')
  .option('-t, --template [index]', 'Show all templates or create a new project from one of them')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  const createProjectName = cliInput.getOption('create')
  const listProjects = cliInput.getOption('list')
  const projectPath = cliInput.getOption('path')
  const historyIndex = cliInput.getOption('history')
  const templateIndex = cliInput.getOption('template')

  /* Show current project */
  if (!cliInput.hasParams && !cliInput.hasOptions) {
    const currentProject = Project.current()
    if (currentProject) {
      cliPrinter.info(`Current project: ${currentProject.path}`)
    } else {
      cliPrinter.warn('No current project set.')
    }
    return cliNext()
  }

  /* List projects in the same directory */
  if (cliInput.hasOption('list')) {
    const currentProject = Project.current()
    if (currentProject) {
      cliPrinter.info(`Current project: ${currentProject}`)
      cliPrinter.info(`Parent directory: ${currentProject.parentPath}`)
      cliPrinter.newLine()

      const pList = Project.listSiblings()
      if (pList.length > 0) {
        cliPrinter.orderedList(pList, (pItem) => { return pItem.path })
      } else {
        cliPrinter.warn('No projects in the parent directory.')
      }
    } else {
      cliPrinter.warn('No current project set.')
    }
    return cliNext()
  }

  /* Create a project in the same directory */
  if (cliInput.hasOption('create') && createProjectName) {
    // todo
  }

  /* Set or create project from path */
  if (projectPath) {
    // todo
  }

  /* Show project history */
  if (cliInput.hasOption('history') && !historyIndex) {
    // todo
  }

  /* Set project from history */
  if (historyIndex) {
    // todo
  }

  /* Show project templates */
  if (cliInput.hasOption('template') && !templateIndex) {
    // todo
  }

  /* Create project from template */
  if (templateIndex) {
    // todo
  }

  // - - - - - - - - - - - - - - - -

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
