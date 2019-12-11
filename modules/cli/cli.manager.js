const cliParam = require('./cliParam.class.js')
const vorpal = require('vorpal')()

class cliManager {
  constructor () {
    // this.ui_log = vorpal.log;
    this._commands = {}
    this._vorpal = vorpal
    this._delimiter = ''
    this._error_code = -1
    this._success_code = 1

    this._vorpal.on('client_prompt_submit', function (command) {
      if (command === 'exit') {
        configMgr.save()
      }
    })
  }

  show (delimiter) {
    if (delimiter) this._delimiter = delimiter
    configMgr.printMessages()
    this._vorpal
      .delimiter(this._delimiter + '$')
      .show()
  }

  addCommand (cmd_string) {
    const cmd_split = _.split(_.trim(cmd_string), ' ')
    this._commands[cmd_split[0]] = this._vorpal.command(cmd_string)
  }

  addCommandHeader (cmd_label) {
    return this._commands[cmd_label]
  }

  addCommandBody (cmd_label, cmdFn) {
    this._commands[cmd_label].action(this._getActionFn(cmd_label, cmdFn))
  }

  _getActionFn (cmdName, cmdFn) {
    const thiscliMgr = this
    return function (args, cb) {
      const cliReference = this

      cmdFn(cliReference, (code, err) => {
        if (code === thiscliMgr._error_code) {
          d$('command', cmdName, 'terminated with an error.')
          if (err) d$(err)
        }
        configMgr.printMessages()
        cb()
      }, {
        cli_params: new cliParam(args, cmdName),
        error_code: thiscliMgr._error_code,
        success_code: thiscliMgr._success_code,
        ui: clUI.newLocalUI('> ' + cmdName + ':')
      })
    }
  }
}

module.exports = new cliManager()
