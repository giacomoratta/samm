const cliParam = require('./cliParam.class.js')
const cliPrinter = require('./cliPrinter.class.js')
const vorpal = require('vorpal')

const ERROR_CODE = -1
const SUCCESS_CODE = 1

class cliVorpal {
  constructor () {
    this.commands = {}
    this.vorpal = vorpal()
    this.delimiter = ''
    this.logger = console
    this.callback = {
      onShow: null,
      onBeforeNext: null,
      onExit: null
    }

    this.vorpal.on('client_prompt_submit', (command) => {
      if (command === 'exit') {
        if(this.callback.onExit) this.callback.onExit()
        // todo: cb configMgr.save()
      }
    })
  }

  show (delimiter) {
    if (delimiter) this.delimiter = delimiter
    if(this.callback.onShow) this.callback.onShow()
    //todo: cb - configMgr.printMessages()
    this.vorpal
      .delimiter(this.delimiter + '$')
      .show()
  }

  addCommand (cmdString) {
    const cmd_split = _.split(_.trim(cmdString), ' ')
    this.commands[cmd_split[0]] = this.vorpal.command(cmdString)
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
        if(this.callback.onBeforeNext) this.callback.onBeforeNext()
        // todo: cb configMgr.printMessages()
        cb()
      }, {
        cli_params: new cliParam(args, cmdName),
        error_code: ERROR_CODE,
        success_code: SUCCESS_CODE,
        ui: clUI.newLocalUI('> ' + cmdName + ':')
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

  setCallback(event, cb) {
    if(!Object(this.callback).hasOwnProperty(event)) {
      this.logger.warn(`Invalid event for callback ${event}`)
      return false
    }
    this.callback[event] = cb
    return true
  }
}

module.exports = cliVorpal
