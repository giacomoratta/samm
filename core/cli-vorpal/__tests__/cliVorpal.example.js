const { cliVorpal } = require('../cliVorpal.class')
const vCli = new cliVorpal()

vCli.on('beforeCommand',(e) => {
    console.info('test beforeCommand event message',e.command)
})

vCli.on('afterCommand',(e) => {
    console.info('test beforeCommand event message',e.command)
})

vCli.addCommand('projects <reqA> <reqB> [optA] [optB]')

vCli.addCommandHeader('projects')
    .description("Manage all projects" + '\n')
    .option('-a, --all', 'Shows all projects')
    .option('--save', 'Save bookmarks in the current project')
    .option('-d, --dirname <dirname>', 'Set directory name.')

vCli.addCommandBody('projects', function (cliReference, cliNextCb, cliData) {
    console.log(cliData)
    return cliNextCb(cliData.successCode)
})

vCli.addCommand('simple')

vCli.addCommandBody('simple', function (cliReference, cliNextCb, cliData) {
    console.log(cliData)
    return cliNextCb(cliData.successCode)
})

vCli.show('abc')
