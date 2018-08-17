const CliParams = require('./CliParams.class.js');
const vorpal = require('vorpal')();
const readlineSync = require('readline-sync');

class CliManager {

    constructor(){
        this.ui_log = vorpal.log;
        this._error_code = -1;
        this._success_code = 1;
        this.cli_params = null;
        this._setCliCommandManagers();
    }

    processParams(cli_values, command){
        //d(cli_values);
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
        vorpal
            .command('config show')
            .description('Show the configuration.')
            .option('-i, --internals', 'Show internal configuration data.')
            .action(this._getActionFn('config',()=>{
                if(this.cli_params.hasOption('internals') || this.cli_params.hasOption('i')) ConfigMgr.printInternals();
                else ConfigMgr.print();
                return this._success_code;
            }));

        vorpal
            .command('config set <name> [values...]')
            .autocomplete(ConfigMgr.getConfigParams())
            .description("Set the value of a configuration parameter." +
                "\n$ config set Project project-name / (or path)" +
                "\n$ config set Tag tag-label query,tag+tag2,or,tag3" +
                "\n$ config set ExtensionExcludedForSamples ext / (or .ext)" +
                "\n$ config set ExtensionExcludedForSamples !ext / (or !.ext)")
            .action(this._getActionFn('config',()=>{
                if(ConfigMgr.setFromCliParams(this.cli_params.get('name'),this.cli_params.get('values'))===null){
                    UI.print("Set command: configuration not changed");
                    return this._error_code;
                }
                if(ConfigMgr.save()!==true){
                    UI.print("Set command: error during file writing");
                    return this._error_code;
                }
                UI.print("Set command: configuration saved successfully");
                ConfigMgr.print();
                return this._success_code;
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
