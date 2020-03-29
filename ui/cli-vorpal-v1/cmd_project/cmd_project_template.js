const { API, Cli } = require('../ui_common')

const Config = API.config
const ProjectManager = API.projectManager
const ProjectHistory = API.projectHistory
const ProjectTemplate = API.projectTemplate

const commandName = 'project-template'
Cli.addCommand(commandName)

Cli.addCommandHeader(commandName)
  .description('Show all templates or create a new project from one of them.\n')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  if (Config.field('TemplatesDirectory').unset !== false) {
    cliPrinter.warn('No templates directory set (type \'config TemplatesDirectory template\\directory\\folder\')')
  } else if (await Config.field('TemplatesDirectory').fn.exists() !== true) {
    cliPrinter.warn(`Template directory does not exist: ${Config.field('TemplatesDirectory').value}`)
  } else {
    cliPrinter.info(`Templates directory: ${Config.field('TemplatesDirectory').value}`)

    let tplIndex = -1
    const tplList = await ProjectTemplate.list()

    await cliPrompt({
      message: 'Select a template to start a new project',
      showFn: () => {
        cliPrinter.orderedList(tplList, (pItem) => {
          const date = new Date(pItem.modifiedAt)
          return `${pItem.name} [${pItem.path.length > 36 ? '...' : ''}${pItem.path.substr(-36)}] ${date.toUTCString()}`
        })
      }
    }, async ({ exit, input }) => {
      if (exit === true) return true

      tplIndex = parseInt(input)
      if (isNaN(tplIndex) || tplIndex < 1 || tplIndex > tplList.length) {
        cliPrinter.warn(`Invalid input: choose an index between 1 and ${tplList.length}.`)
        return false
      }

      tplIndex--
      return true
    })

    const currentProject = ProjectManager.getCurrentProject()
    if (!currentProject) {
      cliPrinter.warn('No current project set: cannot create a project in the same directory.')
    } else if (tplIndex >= 0) {
      cliPrinter.warn('...to be implemented...')
    }
  }

  return cliNext()
})
