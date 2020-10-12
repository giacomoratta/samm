/* Entry point for build process */

process.env.APP_ROOT_PATH = process.cwd()
process.env.NODE_ENV = 'production'
process.env.APP_DATA_DIRNAME = 'samm-data'

/* Start UI and APP */
require('./ui/cli-vorpal-v1/ui_start')
