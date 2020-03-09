const { Cli, App } = require('./ui_common')
const { apiConfig } = App

// todo: set logger ?

// require('./cmd_bookm')
require('./cmd_config')
// require('./cmd_lookup')
// require('./cmd_project')
// require('./cmd_query')
// require('./cmd_save')
// require('./cmd_scan')

const ConfigStatusMessages = () => {
  const statusFlags = apiConfig.field('Status').value
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

App.boot().then((outcome) => {
  if (outcome === false) {
    Cli.printer.error('Severe internal error: app cannot be initialized (see logs).')
  }
  Cli.show('mpl')
}).catch((e) => {
  Cli.printer.error(e)
})
