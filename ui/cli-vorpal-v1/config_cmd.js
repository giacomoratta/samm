const { vCli } = require('./cliVorpal')
const App = require('../../app')

vCli.addCommand('projects <reqA> <reqB> [optA] [optB]')

vCli.addCommandHeader('projects')
  .description('Manage all projects' + '\n')
  .option('-a, --all', 'Shows all projects')
  .option('--save', 'Save bookmarks in the current project')
  .option('-d, --dirname <dirname>', 'Set directory name.')

vCli.addCommandBody('projects', function (cliReference, cliNextCb, cliData) {
  console.log(cliData)
  return cliNextCb(cliData.successCode)
})
