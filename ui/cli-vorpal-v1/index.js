const { Cli, App } = require('./common')

require('./bookm_cmd')
require('./config_cmd')
require('./lookup_cmd')
require('./project_cmd')
require('./query_cmd')
require('./save_cmd')
require('./scan_cmd')

App.boot().then(() => {
    Cli.show('mpl')

}).catch((e) => {
    Cli.printer.error(e)
})
