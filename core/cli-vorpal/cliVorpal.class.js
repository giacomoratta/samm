const Events = require('events')
const vorpal = require('vorpal')
const { CliInput } = require('./cliInput.class.js')
const { CliPrinter } = require('./cliPrinter.class')

const { CLI_CMD_ERR_FORMAT, CLI_CMD_KO, ACCEPTED_EVENTS } = require('./constants')

class CliVorpal {
  constructor () {
    this.commands = {}
    this.vorpal = vorpal()
    this.delimiter = ''
    this.logger = console
    this.printer = new CliPrinter({
      logFn: (msg) => { this.vorpal.log(msg) } // workaround (logFn=this.log does not work)
    })
    this.eventEmitter = new Events()

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

  addCommand (cmdName, cmdArgs = '') {
    cmdName = cmdName.trim()
    this.commands[cmdName] = this.vorpal.command(`${cmdName} ${cmdArgs}`)
    return cmdName
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
      /* this function must be a normal function (not lambda or something else);
       * the keyword 'this' will be thisCli argument for cmdFn() and its needed, for instance, to call prompt method
       * todo: avoid calling every time
       */

      const thisCli = this
      const cliInput = new CliInput({ values, command })

      const cliPrinter = new CliPrinter({
        command,
        logFn: (msg) => { thisCli.log(msg) } // workaround (logFn=this.log does not work)
      })

      const cliNext = (code, err) => {
        if (code === CLI_CMD_KO) {
          self.logger.error(`command '${command}' terminated with an error.`)
          if (err) self.logger.error(err)
        } else if (code === CLI_CMD_ERR_FORMAT) {
          cliPrinter.error(`Incorrect format for command; type ${command} --help`)
        }
        self.eventEmitter.emit('afterCommand', { logger: self.logger, command })
        cliPrinter.newLine()
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
        if (props.message) props.message = `${cliPrinter.indent}${props.message}\n${promptMessage}`
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
          cliPrinter.newLine()
          if (showFn) showFn()
          try {
            await thisCli.prompt(props, (result) => {
              input = result.inputValue
            })
            cliPrinter.newLine()
            const exit = input === 'q' // || isNaN(input.charCodeAt(0)) === true

            if (await handler({ exit, input }) !== true) {
              cliPrinter.newLine()
              await _promptFn(handler)
            }
          } catch (e) {
            await handler({ exit: true })
          }
        }
        return _promptFn(handler)
      }

      cliPrinter.newLine()
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

module.exports = { CliVorpal }
