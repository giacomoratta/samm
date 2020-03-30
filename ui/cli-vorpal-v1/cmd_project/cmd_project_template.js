const { API, Cli } = require('../ui_common')

const Config = API.config
const ProjectManager = API.projectManager
const ProjectTemplate = API.projectTemplate

const commandName = 'project-template'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all templates or create a new project from one of them.\n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliPrinter, cliPrompt }) {
  if (Config.field('TemplatesDirectory').unset !== false) {
    cliPrinter.warn('No templates directory set (type \'config TemplatesDirectory template\\directory\\folder\')')
    return cliNext()
  } else if (await Config.field('TemplatesDirectory').fn.exists() !== true) {
    cliPrinter.warn(`Template directory does not exist: ${Config.field('TemplatesDirectory').value}`)
    return cliNext()
  }

  let tplIndex = -1
  let prjName
  const tplList = await ProjectTemplate.list()
  const currentProject = ProjectManager.getCurrentProject()

  cliPrinter.info('NOTE: This feature allows to start a new project in the current project\'s parent path.')
  !currentProject && cliPrinter.warn('no current project: it is mandatory to have a current project set.')

  await cliPrompt({
    message: 'Select template and type a project name: <index> <project-name>',
    showFn: () => {
      cliPrinter.info(`Current project: ${(currentProject && currentProject.path) || '<unknown>'}\n`)
      cliPrinter.info(`Templates directory: ${Config.field('TemplatesDirectory').value}`)
      cliPrinter.orderedList(tplList, (pItem) => {
        const date = new Date(pItem.modifiedAt)
        return `${pItem.name}  (${date.toUTCString()})`
      })
    }
  }, async ({ exit, input }) => {
    if (exit === true) {
      return true
    }

    [tplIndex, prjName] = input.split(' ')
    tplIndex = parseInt(tplIndex)
    if (isNaN(tplIndex) || tplIndex < 1 || tplIndex > tplList.length) {
      cliPrinter.warn(`Invalid <index>: choose an index between 1 and ${tplList.length}.`)
      tplIndex = -1
      return false
    }

    if (prjName) prjName = prjName.trim()
    if (!prjName || prjName.length < 2) {
      cliPrinter.warn(`Invalid <project-name>: set a valid project name (invalid '${prjName}').`)
      prjName = undefined
      return false
    }

    if (!currentProject) {
      cliPrinter.warn('No current project set: cannot create a project in the same directory.')
      return true
    }

    try {
      tplIndex--
      const templateProject = tplList[tplIndex]
      const createResult = await ProjectTemplate.createFrom({
        templateProject,
        parentPath: currentProject.parentPath,
        projectName: prjName
      })

      if (!createResult.project) {
        cliPrinter.warn(`The project already exists: ${createResult.candidatePath}`)
      } else {
        cliPrinter.info('Project created successfully.')
        await ProjectManager.setCurrentProject({ projectObj: createResult.project })
        cliPrinter.info(`New current project: ${ProjectManager.getCurrentProject().path}.`)
      }
    } catch (error) {
      cliPrinter.error('Cannot create the new project!')
      cliPrinter.error(`> reason: ${error.message}`)
    }
    return true
  })

  return cliNext()
})
