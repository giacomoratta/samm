const { API } = require('../../ui_common')
const ProjectManager = API.projectManager

module.exports = async function ({ optList, cliNext, cliPrinter, cliPrompt }) {
  const currentProject = ProjectManager.getCurrentProject()

  if (currentProject) {
    const pList = ProjectManager.listSiblings()
    if (pList.length > 0) {
      await cliPrompt({
        // message: '',
        showFn: () => {
          cliPrinter.info(`Current project: ${currentProject}\n`)
          cliPrinter.info(`Projects in parent directory: ${currentProject.parentPath}`)
          cliPrinter.orderedList(pList, (pItem) => { return pItem.path })
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
  } else {
    cliPrinter.warn('No current project set: cannot show projects in the same directory.')
  }
  return cliNext()
}
