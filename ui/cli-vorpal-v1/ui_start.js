const { Cli, App } = require('./ui_common')

require('./cmd_bookm')
require('./cmd_config')
require('./cmd_lookup')
require('./cmd_project')
require('./cmd_query')
require('./cmd_save')
require('./cmd_scan')

// todo: move here some code from common.js (messages and general things)

App.boot().then((outcome) => {
  if (outcome === false) {
    Cli.printer.error('Severe internal error: app cannot be initialized (see logs).')
  }
  Cli.show('mpl')
}).catch((e) => {
  Cli.printer.error(e)
})
