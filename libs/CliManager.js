const CliParams = require('./CliParams.class.js');
const vorpal = require('vorpal')();
const readlineSync = require('readline-sync');

class CliManager {

    constructor(){
        this._error_code = -1;
        this._success_code = 1;
        this.cli_params = null;
        this._setCliCommandManagers();
    }

    processParams(cli_values, command){
        this.cli_params = new CliParams(cli_values, command);
        d(this.cli_params);
        return this.cli_params;
    }

    show(){
        vorpal
            .delimiter('mpl$')
            .show();
    }

    _setCliCommandManagers(){
        this.C_Config();
    }

    _getActionFn(cmdName, cmdFn){
        return (args,callback)=>{
            this.processParams(args,cmdName);
            cmdFn();
            console.log("");
            callback();
        };
    }


    readLine(){
        return readlineSync.prompt()
    }

    waitForEnter(){
        readlineSync.prompt();
    }


    C_Config(){
        let _self = this;
        vorpal
            .command('config')
            .description('Show the current configuration status.')
            .action(this._getActionFn('config',()=>{
                ConfigMgr.printStatus();
                ConfigMgr.print();
            }));
    }

    C_xx(){
        /*
        vorpal
            .command('foo <requiredArg> [optionalArg]')
            .option('-v, --verbose', 'Print foobar instead.')
            .option('-a, --amo-unt <coffee>', 'Number of cups of coffee.')
            .option('-A', 'Does amazing things.', ['Unicorn', 'Narwhal', 'Pixie'])
            .description('Outputs "bar".')
            //.alias('foosball')
            .action(function(args, callback) {
                console.log(args);
                if (args.options.verbose) {
                    this.log('foobar');
                } else {
                    this.log('bar');
                }
                callback();
            });
        */
    }

};

module.exports = new CliManager();
