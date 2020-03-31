const log = require('../../core/logger').createLogger('samples')

const clean = async () => {
  log.info('Cleaning data...')
}

const boot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  return true
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
      has: () => {
        return false
      },
      size: () => {
        return -1
      },
      create: async () => {
        return false
      }
    }
  }
}
