const { Cli, App, log } = require('./ui_common')
const { API } = App

// require('./cmd_bookm')
require('./cmd_config')
// require('./cmd_lookup')
// require('./cmd_project')
// require('./cmd_query')
// require('./cmd_save')
// require('./cmd_scan')

const ConfigStatusMessages = () => {
  const statusFlags = API.config.field('Status').value
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
  messages.forEach((line) => {
    Cli.printer.newLine()
    Cli.printer.warn(`${line}`)
  })
  Cli.printer.newLine()
  // Cli.printer.boxed(messages,'WARNING')
}

Cli.on('show', printWarnings)
Cli.on('afterCommand', printWarnings)

App.boot({
  appRootPath: process.cwd()

}).then((outcome) => {
  if (outcome === false) {
    Cli.printer.error('Severe internal error: app cannot be initialized (see logs).')
  }
  Cli.show('mpl')
}).catch((e) => {
  log.error(e)
  Cli.printer.error(e)
})
