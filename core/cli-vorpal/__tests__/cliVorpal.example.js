const cliVorpal = new (require('../cliVorpal.class'))()

cliVorpal.addCommand('projects <reqA> <reqB> [optA] [optB]')

cliVorpal.addCommandHeader('projects')
    .description("Manage all projects" + '\n')
    .option('-a, --all', 'Shows all projects')
    .option('--save', 'Save bookmarks in the current project')
    .option('-d, --dirname <dirname>', 'Set directory name.')

cliVorpal.addCommandBody('projects', function (cliReference, cliNextCb, cliData) {
    console.log(cliData)
    return cliNextCb(cliData.successCode)
})

cliVorpal.addCommand('simple')

cliVorpal.addCommandBody('simple', function (cliReference, cliNextCb, cliData) {
    console.log(cliData)
    return cliNextCb(cliData.successCode)
})

cliVorpal.show('abc')
