const Events = require('events')
const vorpal = require('vorpal')
const { CliInput } = require('./cliInput.class.js')
const { CliPrinter } = require('./cliPrinter.class')

const CLI_ERROR = -1
const CLI_SUCCESS = 1
const ACCEPTED_EVENTS = ['show', 'exit', 'beforeCommand', 'afterCommand']

class CliVorpal {
  constructor () {
    this.commands = {}
    this.vorpal = vorpal()
    this.delimiter = ''
    this.logger = console
    this.eventEmitter = new Events()

    this.vorpal.on('client_prompt_submit', (command) => {
      if (command === 'exit') {
        this.eventEmitter.emit('exit', { logger: this.logger })
        // todo: cb configMgr.save()
      }

      /* prevent event emit when enter is pressed with no command */
      if (command) {
        this.eventEmitter.emit('beforeCommand', { logger: this.logger, command })
      }
    })
  }

  show (delimiter) {
    if (delimiter) this.delimiter = delimiter
    this.eventEmitter.emit('show', { logger: this.logger })
    // todo: cb - configMgr.printMessages()
    this.vorpal
      .delimiter(this.delimiter + '$')
      .show()
  }

  addCommand (cmdString) {
    const cmdSplit = cmdString.trim().split(' ')
    this.commands[cmdSplit[0]] = this.vorpal.command(cmdString)
    return cmdSplit[0]
  }

  addCommandHeader (command) {
    if (!this.commands[command]) {
      throw new Error(`Command ${command} not defined. Use addCommand().`)
    }
    return this.commands[command]
  }

  addCommandBody (command, cmdFn) {
    if (!this.commands[command]) {
      throw new Error(`Command ${command} not defined. Use addCommand().`)
    }
    const self = this
    this.commands[command].action(function (values, cb) {
      /* this function has to be a normal function not lambda or something else;
       * the keyword 'this' will be cliReference and its needed, for instance, to call prompt method */

      cmdFn({
        thisCli: this,
        cliNext: (code, err) => {
          if (code === CLI_ERROR) {
            self.logger.error(`command '${command}' terminated with an error.`)
            if (err) self.logger.error(err)
          }
          self.eventEmitter.emit('afterCommand', { logger: self.logger, command })
          // todo: cb configMgr.printMessages()
          cb()
        },
        cliInput: new CliInput({ values, command }),
        cliPrinter: new CliPrinter({ command })
      })
    })
  }

  setLogger (logger) {
    if (!logger.debug ||
        !logger.info ||
        !logger.warn ||
        !logger.error) return false
    this.logger = logger
    return true
  }

  on (eventName, cb) {
    if (!ACCEPTED_EVENTS.includes(eventName)) {
      throw new Error(`Invalid event '${eventName}'`)
    }
    this.eventEmitter.on(eventName, cb)
  }
}

module.exports = {
  CliVorpal,
  CLI_ERROR,
  CLI_SUCCESS
}
