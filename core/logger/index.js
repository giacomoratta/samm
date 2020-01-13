if (process.env.NODE_ENV !== 'production') {
  module.exports = require('./basic.logger')
} else {
  module.exports = require('./pino.logger')
}
