const { Cli, App } = require('./common')

require('./bookm_cmd')
require('./config_cmd')
require('./lookup_cmd')
require('./project_cmd')
require('./query_cmd')
require('./save_cmd')
require('./scan_cmd')

// todo: move here some code from common.js (messages and general things)

App.boot().then((outcome) => {
  if (outcome === false) {
    Cli.printer.error('Severe internal error: app cannot be initialized (see logs).')
  }
  Cli.show('mpl')
}).catch((e) => {
  Cli.printer.error(e)
})
