const log = require('../../core/logger').createLogger('project')

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
    project: {
      create: (template) => {},
      current: () => {}
    },

    history: {
      get: (index) => {},
      latest: () => {},
      list: () => {}
    },

    template: {
      list: () => {
        // list from config.templateDir
      }
    }
  }
}
