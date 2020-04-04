const log = require('../logger').createLogger('bookmarks')

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
    bookmarks: {
      add: (label, sampleObj) => {},
      remove: (label, sampleObj) => {}, // or index
      get: (label, index) => {},
      labels: () => {},
      list: (label) => {}
    }
  }
}
