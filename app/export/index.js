const { exportSampleSet, getExportPath } = require('./exportSampleSet')
const log = require('../logger').createLogger('export')

const clean = async () => {
  log.info('Cleaning data...')
}

const boot = async () => {
  log.info('Booting...')
}

module.exports = {
  boot,
  clean,

  ExportAPI: {
    getExportPath,
    exportSampleSet
  }
}
