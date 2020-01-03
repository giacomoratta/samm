const pino = require('pino')({
  level: (process.env.NODE_ENV === 'production' ? 20 : 10)
})

console.log(process.env.NODE_ENV)

const newLogger = (module) => {
  return pino.child({ module })
}

x = newLogger('ciao')
x.trace('test')

module.exports = newLogger
