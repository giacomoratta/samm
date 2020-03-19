
/* ENV variables */
// console.log(process.env.NODE_ENV)
// console.log(process.env.APP_DATA_DIRNAME)
process.env.APP_ROOT_PATH = process.cwd()

/* Start UI and APP */
require('./ui/cli-vorpal-v1/ui_start')
