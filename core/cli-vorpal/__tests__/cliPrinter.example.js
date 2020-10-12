const { CliPrinter } = require('../cliPrinter.class')

const cliP1 = new CliPrinter({ command: 'mycmd1' })

cliP1.info('ciao info')
cliP1.warn('ciao warn')
cliP1.error('ciao error')

const cliP2 = new CliPrinter({ command: 'mycmd2', indentLevel: 2 })

cliP2.info('ciao info')
cliP2.warn('ciao warn')
cliP2.error('ciao error')

cliP2.orderedList(['abc', 'def', 'ghi'])
cliP2.unorderedList(['abc', 'def', 'ghi'])

cliP2.title('simple map title')
cliP2.simpleMap({ k3: 'v1', k1: 'v1', k2: 'v2' })

cliP2.simpleMapByKey({ k3: 'v1', k1: 'v1', k2: 'v2' })
