const CliParams = require('./micro/CliParams.class.js');
const vorpal = require('vorpal')();

class CliManager {

    constructor(){
        //this.ui_log = vorpal.log;
        this._commands = {};
        this._vorpal = vorpal;
        this._delimiter = '';
        this._error_code = -1;
        this._success_code = 1;
    }

    show(delimiter){
        if(delimiter) this._delimiter=delimiter;
        ConfigMgr.printMessages();
        this._vorpal
            .delimiter(this._delimiter+'$')
            .show();
    }

    addCommand(cmdstring){
        let cmd_split = _.split(_.trim(cmdstring)," ");
        this._commands[cmd_split[0]] = this._vorpal.command(cmdstring);
    }

    addCommandHeader(cmd_label){
        return this._commands[cmd_label];
    }

    addCommandBody(cmd_label,cmdFn){
        this._commands[cmd_label].action(this._getActionFn(cmd_label,cmdFn));
    }

    _getActionFn(cmdName, cmdFn){
        const thisCliMgr = this;
        return function(args,cb){
            const cliReference = this;
            
            cmdFn(cliReference,(code,err)=>{
                if(code===thisCliMgr._error_code){
                    d$('command',cmdName,'terminated with an error.');
                    if(err) d$(err);
                }
                ConfigMgr.printMessages();
                clUI.print(' ');//new line before the prompt
                cb();
            },{
                cli_params:new CliParams(args, cmdName),
                error_code:thisCliMgr._error_code,
                success_code:thisCliMgr._success_code,
                ui: clUI.newLocalUI('> '+cmdName+':')
            });
        };
    }

}

module.exports = new CliManager();
