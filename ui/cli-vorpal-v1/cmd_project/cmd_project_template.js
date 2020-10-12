const { App, Cli } = require('../ui_common')
const { ConfigAPI, ProjectManagerAPI, ProjectTemplateAPI } = App

const commandName = 'project-template'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all templates or create a new project from one of them.\n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliPrinter, cliPrompt }) {
  if (ConfigAPI.field('TemplatesDirectory').unset !== false) {
    cliPrinter.warn('No templates directory set (type \'config TemplatesDirectory template\\directory\\folder\')')
    return cliNext()
  } else if (await ConfigAPI.field('TemplatesDirectory').fn.exists() !== true) {
    cliPrinter.warn(`Template directory does not exist: ${ConfigAPI.field('TemplatesDirectory').value}`)
    return cliNext()
  }

  let tplIndex = -1
  let prjName
  const tplList = await ProjectTemplateAPI.list()
  const currentProject = ProjectManagerAPI.getCurrentProject()

  cliPrinter.info('NOTE: This feature allows to start a new project in the current project\'s parent path.')
  !currentProject && cliPrinter.warn('no current project: it is mandatory to have a current project set.')

  await cliPrompt({
    message: 'Select template and type a project name: <index> <project-name>',
    showFn: () => {
      cliPrinter.info(`Current project: ${(currentProject && currentProject.path) || '<unknown>'}\n`)
      cliPrinter.info(`Templates directory: ${ConfigAPI.field('TemplatesDirectory').value}`)
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
      const createResult = await ProjectTemplateAPI.createFrom({
        templateProject,
        parentPath: currentProject.parentPath,
        projectName: prjName
      })

      if (!createResult.project) {
        cliPrinter.warn(`The project already exists: ${createResult.candidatePath}`)
      } else {
        cliPrinter.info('Project created successfully.')
        await ProjectManagerAPI.setCurrentProject({ projectObj: createResult.project })
        cliPrinter.info(`New current project: ${ProjectManagerAPI.getCurrentProject().path}.`)
      }
    } catch (error) {
      cliPrinter.error('Cannot create the new project!')
      cliPrinter.error(`> reason: ${error.message}`)
    }
    return true
  })

  return cliNext()
})
