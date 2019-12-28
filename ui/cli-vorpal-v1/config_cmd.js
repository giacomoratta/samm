const { App, Cli, CLI_SUCCESS, CLI_ERROR } = require('./common')

Cli.addCommand('projects <reqA> <reqB> [optA] [optB]')

Cli.addCommandHeader('projects')
  .description('Manage all projects' + '\n')
  .option('-a, --all', 'Shows all projects')
  .option('--save', 'Save bookmarks in the current project')
  .option('-d, --dirname <dirname>', 'Set directory name.')

Cli.addCommandBody('projects', function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  //console.log(cliData)
  return cliNext(CLI_SUCCESS)
})
