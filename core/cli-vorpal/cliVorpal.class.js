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
    this.printer = new CliPrinter({ command: null })

    this.vorpal.on('client_prompt_submit', (command) => {
      if (command === 'exit') {
        this.eventEmitter.emit('exit', { logger: this.logger })
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
      // todo: avoid calling every time

      /* this function must be a normal function (not lambda or something else);
       * the keyword 'this' will be thisCli argument for cmdFn() and its needed, for instance, to call prompt method */
      self.printer.newLine()
      const thisCli = this
      const cliInput = new CliInput({ values, command })
      const cliPrinter = new CliPrinter({ command })
      const cliNext = (code, err) => {
        if (code === CLI_ERROR) {
          self.logger.error(`command '${command}' terminated with an error.`)
          if (err) self.logger.error(err)
        }
        self.eventEmitter.emit('afterCommand', { logger: self.logger, command })
        self.printer.newLine()
        cb()
      }

      const cliPrompt = function (props, handler) {
        if (!handler) {
          handler = props
          props = {}
        }

        const exitValue = props.exitValue || 'q'
        delete props.exitValue

        const promptMessage = `${cliPrinter.indent}[${exitValue}:quit] > `
        if (props.message) props.message = `${cliPrinter.indent}${props.message} \n${promptMessage}`
        else props.message = `${promptMessage}`

        const showFn = props.showFn || null
        delete props.showFn

        props = {
          type: 'input',
          name: 'inputValue',
          ...props
        }

        const _promptFn = async function (handler) {
          let input = null
          self.printer.newLine()
          if (showFn) showFn()
          try {
            await thisCli.prompt(props, (result) => {
              input = result.inputValue
            })
            self.printer.newLine()
            const exit = input === 'q' // || isNaN(input.charCodeAt(0)) === true

            if (await handler({ exit, input }) !== true) {
              self.printer.newLine()
              await _promptFn(handler)
            }
          } catch (e) {
            await handler({ exit: true })
          }
        }
        return _promptFn(handler)
      }

      cmdFn({
        thisCli,
        cliNext,
        cliInput,
        cliPrinter,
        cliPrompt
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
