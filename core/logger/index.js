if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV !== 'production') {
  module.exports = require('./pino.logger')
} else {
  module.exports = require('./basic.logger')
}
