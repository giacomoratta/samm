/**
 *
 * bookm-look: add bookmarks from latest lookup (prompt, label, index)
 *               (prompt info: show all available labels)
 *
 * */

const { App, Cli } = require('../ui_common')

const commandName = 'bookm-look'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ cliNext }) {
  return cliNext()
})
