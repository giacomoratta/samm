const { Cli, CLI_CMD_ERR_FORMAT } = require('../ui_common')

const optCrudHandler = require('./opt_crud')
const optPrintHandler = require('./opt_print')

const commandName = 'query'

Cli.addCommand(`${commandName} [label] [query]`)

Cli.addCommandHeader(commandName) // todo: improve description with examples
  .description('Manage queries for sample, for matching sample directories and files. \n' +
                'In order to add, get or remove a query, use the 2 params label and query. \n'
  )
  .option('-c, --copy <label>', 'Duplicate a query with the specified label.')
  .option('-l, --label <label>', 'Change the label with the specified label.')
  .option('-r, --remove', 'Remove a query.')
  // .option('-u, --uncovered <count>', 'Shows the first <count> uncovered samples by all queries') /* todo */

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter, cliPrompt }) {
  const sharedArgs = { cliNext, cliPrinter, cliPrompt }

  /* List all queries */
  if (!cliInput.hasParams && !cliInput.hasOptions) {
    return optPrintHandler.list(sharedArgs)
  }

  const paramQueryLabel = cliInput.getParam('label')
  const paramQueryString = cliInput.getParam('query')

  /* Create new query */
  if (paramQueryLabel && paramQueryString) {
    return await optCrudHandler.create({ paramQueryLabel, paramQueryString, ...sharedArgs })
  }

  if (paramQueryLabel && !paramQueryString) {
    /* Print a single query */
    if (!cliInput.hasOptions) {
      return optPrintHandler.one({ paramQueryLabel, ...sharedArgs })
    }

    /* Remove a query */
    if (cliInput.hasOption('remove')) {
      return await optCrudHandler.remove({ paramQueryLabel, ...sharedArgs })
    }

    /* Rename a query */
    if (cliInput.hasOption('label')) {
      const paramNewQueryLabel = cliInput.getOption('label')
      return await optCrudHandler.rename({ paramQueryLabel, paramNewQueryLabel, ...sharedArgs })
    }

    /* Copy a query */
    if (cliInput.hasOption('copy')) {
      const paramNewQueryLabel = cliInput.getOption('copy')
      return await optCrudHandler.copy({ paramQueryLabel, paramNewQueryLabel, ...sharedArgs })
    }
  }

  return cliNext(CLI_CMD_ERR_FORMAT)
})
