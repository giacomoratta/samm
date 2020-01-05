const { Cli } = require('./common')

require('./config_cmd')
require('./query_cmd')
require('./scan_cmd')

Cli.show('mpl')
