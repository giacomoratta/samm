const { Cli, App, API, log } = require('./ui_common')

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
    console.warn(`\n${line}`)
  })
  console.log('\n')
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
  require('./cmd_project')
  require('./cmd_query')
  require('./cmd_samples')

  Cli.show('mpl')
}).catch((e) => {
  log.error(e)
  console.error(`Unexpected error: ${e.message}.  (see logs for more details)`)
})
