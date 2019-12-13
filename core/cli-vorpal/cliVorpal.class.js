const events = require('events')
const vorpal = require('vorpal')
const cliInput = require('./cliInput.class.js')
const cliPrinter = require('./cliPrinter.class.js')

const ERROR_CODE = -1
const SUCCESS_CODE = 1
const ACCEPTED_EVENTS = ['show','exit','beforeNext']

class cliVorpal {
  constructor () {
    this.commands = {}
    this.vorpal = vorpal()
    this.delimiter = ''
    this.logger = console
    this.eventEmitter = new events()

    this.vorpal.on('client_prompt_submit', (command) => {
      if (command === 'exit') {
        // todo: cb configMgr.save()
      }
    })
  }

  show (delimiter) {
    if (delimiter) this.delimiter = delimiter
    this.eventEmitter.emit('show')
    //todo: cb - configMgr.printMessages()
    this.vorpal
      .delimiter(this.delimiter + '$')
      .show()
  }

  addCommand (cmdString) {
    const cmdSplit = cmdString.trim().split(' ')
    this.commands[cmdSplit[0]] = this.vorpal.command(cmdString)
    return cmdSplit[0]
  }

  addCommandHeader (cmdLabel) {
    return this.commands[cmdLabel]
  }

  addCommandBody (cmdName, cmdFn) {
    this.commands[cmdName].action((args, cb) => {

      /* args: cliReference, cliNextCb, cliData */
      cmdFn(this, (code, err) => {
        if (code === ERROR_CODE) {
          this.logger.info('command', cmdName, 'terminated with an error.')
          if (err) this.logger.info(err)
        }
        // todo: cb configMgr.printMessages()
        cb()
      }, {
        cliInput: new cliInput(args, cmdName),
        errorCode: ERROR_CODE,
        successCode: SUCCESS_CODE,
        //ui: clUI.newLocalUI('> ' + cmdName + ':')
      })
    })
  }

  setLogger(logger) {
    if( !logger.debug ||
        !logger.info ||
        !logger.warn ||
        !logger.error ) return false
    this.logger = logger
    return true
  }

  on (eventName, cb) {
    if(!ACCEPTED_EVENTS.includes(eventName)) {
      this.logger.warn(`Invalid event '${eventName}'`)
      return false
    }
    this.eventEmitter.on(eventName, () => {
      cb()
    })
    return true
  }
}

module.exports = {
  cliVorpal,
  ERROR_CODE,
  SUCCESS_CODE
}
