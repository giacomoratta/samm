const { Cli, App, log } = require('./ui_common')
const { ConfigAPI } = App

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

Cli.on('show', printWarnings)
Cli.on('afterCommand', printWarnings)

App.boot({
  appRootPath: process.env.APP_ABSPATH || process.cwd()

}).then((outcome) => {
  if (outcome === false) {
    console.error('Severe internal error: app cannot be initialized (see logs).\n')
    return
  }

  require('./cmd_config')
  require('./cmd_lookup')
  require('./cmd_project')
  require('./cmd_query')
  require('./cmd_samples')
  require('./cmd_search')

  Cli.show('mpl')
}).catch((e) => {
  log.error(e)
  console.error(`Unexpected error: ${e.message}.  (see logs for more details)`)
})
