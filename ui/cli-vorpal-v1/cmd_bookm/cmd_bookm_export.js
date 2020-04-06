/**
 * bookm-export [path]: all bookmarks to current project dir or external dir
 *
 * */

const { App, Cli } = require('../ui_common')

const commandName = 'bookm-export'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ cliNext }) {
  return cliNext()
})
