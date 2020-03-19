const log = require('../../core/logger').createLogger('samples')

const clean = async () => {
  log.info('Cleaning data...')
}

const boot = async () => {
  log.info('Booting...')
}

module.exports = {
  boot,
  clean,

  API: {
    sampleSet: {
      create: ({ queryString, queryLabel, pathBasedQuery }) => {},
      latest: () => {}
    },

    sampleLookup: {
      create: ({ queryString, queryLabel, pathBasedQuery }) => {},
      latest: () => {}
    },

    sampleIndex: {
      has: () => {},
      size: () => {},
      create: () => {}
    }
  }
}
