
global.ENV_CONFIG = {
  debug_enabled: false,
  absolute_app_path: ''
}
ENV_CONFIG.absolute_app_path = process.argv[0] // nexe has the path as first parameter

require('./globals.js')

require('./__toDel/old_app_init.js')
