const { Cli } = require('./common')

require('./bookm_cmd')
require('./config_cmd')
require('./lookup_cmd')
require('./project_cmd')
require('./query_cmd')
require('./save_cmd')
require('./scan_cmd')

Cli.show('mpl')
