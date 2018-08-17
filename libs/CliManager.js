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
        this.C_Scan();
        this.C_Lookup();
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


    C_Lookup(){
        let config_tags = ConfigMgr.get('Tags');
        vorpal
            .command('lookup [query]')
            .description("Perform a search for the tags and selects random samples; the tag query is an AND/OR query (','=or, '+'=and). " +
                "In order to avoid resource wasting, if the index is already present the scan does not start.")
            .option('-t, --tag <label>', 'Tag label for a query inside the configuration (see config set Tags <label> <query>.',(_.isObject(config_tags)?Object.keys(config_tags):null))
            .action(this._getActionFn('lookup',()=>{
                let tagString=null;

                if(this.cli_params.hasOption(ConfigMgr._cli_options.tag_label)){
                    tagString= this.cli_params.getOptionValue(ConfigMgr._cli_options.tag_label);
                    if(!tagString){
                        UI.print("Lookup command: empty tag label");
                        return this._error_code;
                    }
                    tagString = ConfigMgr.get('Tags')[tagString];
                    if(_.isNil(tagString)){
                        UI.print("Lookup command: unknown tag label after");
                        return this._error_code;
                    }
                }else{
                    tagString = this.cli_params.get('query');
                }

                if(!_.isString(tagString) || tagString.length<1){
                    UI.print("Lookup command: empty tag list");
                    return this._error_code;
                }

                let smp_obj_scan = SamplesMgr.loadSampleScanFromFile();
                if(smp_obj_scan.empty()){
                    UI.print("Lookup command: no sample scan found");
                    return this._error_code;
                }

                let smp_obj = SamplesMgr.searchSamplesByTags(smp_obj_scan, tagString);
                if(!smp_obj){
                    UI.print("Lookup command: sample search failed");
                    return this._error_code;
                }
                else if(smp_obj.empty()){
                    UI.print("Lookup command: no samples found");
                    return this._error_code;
                }

                if(SamplesMgr.isEqualToPreviousLookup(smp_obj)){
                    UI.print("Lookup command: result not changed from last lookup.\n");
                    return this._success_code;
                }

                let _promise = SamplesMgr.saveLookupToFile(smp_obj);
                if(!_promise){
                    UI.print("Lookup command: invalid tags");
                    return this._error_code;
                }

                return _promise.then(function(lf){
                    //UI.print("Lookup command: lookup file successfully created");
                    return lf;
                }).catch(function(e){
                    UI.print("Lookup command: lookup file writing failed");
                });
            }));
    }


    C_Scan(){
        vorpal
            .command('scan')
            .description("Perform a full scan of the samples directory. " +
                "In order to avoid resource wasting, if the index is already present the scan does not start.")
            .option('-f, --force', 'Force the rescan.')
            .action(this._getActionFn('scan',()=>{
                let C_scan_options = {
                    force:false //force scan
                };

                if(!this.cli_params.hasOption('f')){
                    if(SamplesMgr.sampleScanFileExists()){
                        UI.print("Scan command: the index file already exists. Use -f to force a rescan.");
                        return this._error_code;
                    }
                }else{
                    C_scan_options.force = true;
                }

                let smp_obj = SamplesMgr.scanSamples(null,C_scan_options.force);
                if(!smp_obj){
                    UI.print("Scan command: job failed");
                    return this._error_code;
                }
                UI.print("Scan command: job completed ("+smp_obj.size()+" samples found)");
                if(!SamplesMgr.saveSampleScanToFile(smp_obj)){
                    UI.print("Scan command: cannot write the index file");
                    return this._error_code;
                }
                return smp_obj;
            }));
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

};

module.exports = new CliManager();
