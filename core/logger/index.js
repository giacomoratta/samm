if (process.env.NODE_ENV === 'development') {
  module.exports = require('./basic.logger')
} else {
  module.exports = require('./pino.logger')
}
