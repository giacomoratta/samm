const { App, Cli, CLI_SUCCESS, CLI_ERROR } = require('./common')

const PathQuery = App.PathQuery

const commandName = 'query'

Cli.addCommand(`${commandName} [label] [query]`)

/*
 * add      > query label1 abc+cde > save
 * remove   > query label1 -r > save
 * list     > query
 */

Cli.addCommandHeader(commandName)
  .description('Text. \n')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  return cliNext(CLI_SUCCESS)
})
