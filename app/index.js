const { apiConfig, moduleConfig } = require('./config')
// const { apiPathQuery, modulePathQuery } = require('./path-query')
// const { apiProjectHistory, moduleProjectHistory } = require('./project')
// const { apiSample, moduleSample } = require('./sample')
// const { apiExport, moduleExport } = require('./export')

console.error(process.cwd())

const boot = async () => {
  await moduleConfig.boot('file/path/file.json')
  // return false: severe error, app closed
  return true
}

const clean = async () => {
  await moduleConfig.clean()
  return true
}

module.exports = {
  module: {
    boot,
    clean
  },
  apiConfig
  // PathQuery,
  // ProjectHistory,
  // Sample,
  // Export
}
