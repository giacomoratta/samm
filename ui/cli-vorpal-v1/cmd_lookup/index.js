const { App, Cli } = require('./common')

/**
 * lookup: quick lookup on samples
 * -a: get all matching samples
 * -s: save to project dir
 *
 * samples-scan: (with -f)
 *
 */

const commandName = 'samples'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ cliNext }) {
  return cliNext()
})
