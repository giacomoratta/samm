const { Config, ConfigBoot, ConfigCleanData } = require('./config')
// const { PathQuery } = require('./path-query')
// const { ProjectHistory } = require('./project')
// const { Sample } = require('./sample')
// const { Export } = require('./export')

console.error(process.cwd())

const boot = async () => {
  await ConfigBoot('file/path/file.json')
  // return false: severe error, app closed
  return true
}

const clean = async () => {
  await ConfigCleanData()
  // return false: severe error, app closed
  return true
}

module.exports = {
  boot,
  clean,
  Config
  // PathQuery,
  // ProjectHistory,
  // Sample,
  // Export
}
