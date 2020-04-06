/**
 * bookm [label]: show entire list (if label, show single label list)
 *
 * -a <path>: add bookmark (ask for confirmation)
 * -c <new-label>: copy bookmark set with the new label
 * -l <new-label>: rename label
 * -r [index]: remove entire label or remove bookmark from a label by index (ask for confirmation)
 *
 * */
const { App, Cli } = require('../ui_common')

const commandName = 'bookm'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ cliNext }) {
  return cliNext()
})
