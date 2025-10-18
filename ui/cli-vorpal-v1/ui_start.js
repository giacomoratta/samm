const figlet = require('figlet')
const { Cli, App, log } = require('./ui_common')
const { ConfigAPI } = App

const printBigTitle = async () => {
  const text = await figlet.text('samm', {
    font: 'Graffiti'
  })
  console.log(text)
  console.log('Samples Archive Matching Module 1.0.0', '\n')
}

const ConfigStatusMessages = () => {
  const statusFlags = ConfigAPI.field('Status').value
  const statusMessages = []
  if (statusFlags['first-scan-needed'] === true) {
    statusMessages.push('First samples scan needed before start using the app')
  } else if (statusFlags['new-scan-needed'] === true) {
    statusMessages.push('New samples scan needed to keep using the app')
  }
  return statusMessages
}

const printWarnings = () => {
  const messages = ConfigStatusMessages()
  if (messages.length === 0) return
  Cli.printer.newLine()
  messages.forEach((line) => {
    Cli.printer.warn(`${line}`)
  })
}

Cli.on('show', function () {
  printWarnings()
  Cli.printer.newLine()
})
Cli.on('afterCommand', printWarnings)

App.boot({
  appRootPath: process.env.APP_ABSPATH || process.cwd()

}).then((outcome) => {
  if (outcome === false) {
    console.error('Severe internal error: app cannot be initialized (see logs).\n')
    return
  }

  require('./cmd_config')
  require('./cmd_bookm')
  require('./cmd_look')
  require('./cmd_project')
  require('./cmd_query')
  require('./cmd_samples')
  require('./cmd_search')

  printBigTitle().then(() => {
    Cli.show('samm')
  })
}).catch((e) => {
  log.error(e)
  console.error(`Unexpected error: ${e.message}.  (see logs for more details)`)
})
