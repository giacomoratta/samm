const pino = require('pino')({
  level: (process.env.NODE_ENV === 'production' ? 20 : 10),
  base: {}
})

class basicLogger {

  constructor(options){

  }

  trace(){

  }

  debug(){

  }

  info(){

  }

  warn(){

  }

  error(){

  }

}

const createLogger = (module) => {
  return pino.child({ module })
}

module.exports = {
  createLogger
}
