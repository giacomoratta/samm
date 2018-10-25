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
        this.cli_params = new CliParams(cli_values, command);
        return this.cli_params;
    }

    show(){
        vorpal
            .delimiter('mpl$')
            .show();
    }

    _setCliCommandManagers(){
        this.C_Lookup();
        this.C_Save();
        this.C_Coverage();
        this.C_Scan();
        this.C_Show();
        this.C_Config();
    }

    _getActionFn(cmdName, cmdFn){
        return (args,callback)=>{
            this.processParams(args,cmdName);
            let cmdFnResult = cmdFn();

            if(_.isPromise(cmdFnResult)){
                cmdFnResult.then((d)=>{
                    console.log("");
                    callback();
                }).catch((e)=>{
                    console.log("\n");
                    d$('_getActionFn',e);
                    callback();
                })
                return;
            }

            console.log("");
            callback();
        };
    }

    readLine(){
        return readlineSync.prompt()
    }

    waitForEnter(msg){
        if(!_.isString(msg)) msg='[press any key to continue]';
        readlineSync.question("\n"+msg,{
            defaultInput: ''
        });
    }


    C_Coverage(){
        vorpal
            .command('coverage')
            .description('Check the coverage of samples in according to the tag labels present in the configuration.')
            .option('-p, --path <path>', 'Absolute custom path.')
            .option('-q, --query <query>', 'Custom query on tags; e.g.\'tag1+tag2,tag3\'.')
            .option('-c, --covered', 'Get the covered tags (by default, the uncovered tags are returned).')
            .option('-g, --progressive', 'Stops when some files which did not pass the check are found.')
            .option('-k, --prog-keepalive', 'Like --progressive but it keeps the command alive waiting for key \'enter\'.')
            .action(this._getActionFn('coverage',()=>{

                // TODO
                // -lt -gt per selezionare samples poco o troppo coperti

                let C_coverage_options = {
                    path:null,          //custom path   //old: dirPath
                    query:null,         //query tags    //old: tagQuery

                    lookingForCovered:false, //old: lookingForCoverage
                    progressive:false,
                    progressive_keepalive:false,
                    consoleOutput:true
                };

                /* BOOLEANS */
                C_coverage_options.lookingForCovered = this.cli_params.hasOption('covered');
                C_coverage_options.progressive = this.cli_params.hasOption('progressive');
                C_coverage_options.progressive_keepalive = this.cli_params.hasOption('prog-keepalive');

                /* PATH */
                C_coverage_options.path = this.cli_params.getOption('path');
                if(!C_coverage_options.path){
                    if(!SamplesMgr.hasSamplesIndex()){
                        UI.print("Coverage command: no samples index found;\n" +
                            "perform a scan or specify an absolute path with -p option.");
                        return this._error_code;
                    }
                }else if(!_.isString(C_coverage_options.path) || !Utils.File.isAbsoluteParentDirSync(C_coverage_options.path,true)){
                    // check path if is a good absolute path and exists
                    UI.print("Coverage command: path is not an absolute path or it does not exists.");
                    return this._error_code;
                }

                /* QUERY */
                C_coverage_options.tagQuery = this.cli_params.getOption('query');
                if(!C_coverage_options.tagQuery){
                    if(!ConfigMgr.get('Tags')){
                        UI.print("Coverage command: no configured tags found.\n" +
                            "Add one or more tags to the configuration or specify a custom query with -q option.");
                        return this._error_code;
                    }
                }

                //CliMgr.waitForEnter('...');


                console.log(C_coverage_options);
                return;

                let smp_obj = SamplesMgr.checkSamplesCoverage(C_coverage_options);
                if(!_.isObject(smp_obj)){
                    UI.print("Coverage command: something went wrong.");
                    return this._error_code;
                }

                return smp_obj;
            }));
    }


    C_Save(){
        const _self = this;
        vorpal
            .command('save')
            .description('Create a directory with the samples previously found; the directory name is set automatically with some tag names.')
            .option('-d, --dirname <dirname>', 'Save in a directory with a custom name.')
            .option('-p, --path <path>', 'Absolute custom path.')
            .option('-o, --overwrite', 'Overwrite the existent directory.')
            .action(_self._getActionFn('save',()=>{

                if(!ConfigMgr.path('project_directory')){
                    UI.print("Save command: project directory is not set; check the configuration.");
                    return this._error_code;
                }

                let smp_obj = SamplesMgr.getLatestLookup();
                if(!_.isObject(smp_obj)){
                    UI.print("Save command: latest lookup missing.");
                    return this._error_code;
                }

                let smp_dirname = null;
                let C_save_options = {
                    dirname:    this.cli_params.getOption('dirname'),      //custom name
                    overwrite:   this.cli_params.getOption('overwrite'), //force overwrite
                    path:    this.cli_params.getOption('path')       //absolute path
                };

                // check path if is a good absolute path and exists
                if(!_.isString(C_save_options.path) || !Utils.File.isAbsoluteParentDirSync(C_save_options.path,true)){
                    UI.print("Coverage command: path is not an absolute path or it does not exists.");
                    return this._error_code;
                }

                return SamplesMgr.generateSamplesDir(smp_obj,C_save_options).then(function(smp_copied_obj){
                    if(!_.isObject(smp_copied_obj)){
                        UI.print("Save command: no file saved [error#1].");
                        return;
                    }
                    if(smp_copied_obj.size()==0){
                        UI.print("Save command: no file saved.");
                        return;
                    }
                    UI.print("Save command: "+smp_copied_obj.size()+"/"+smp_obj.size()+" files saved.");
                    smp_copied_obj.print();

                }).catch(()=>{
                    UI.print("Save command: no file saved [error#2].");
                });
            }));
    }


    C_Lookup(){
        let config_tags = ConfigMgr.get('Tags');
        vorpal
            .command('lookup [query]')
            .description("Perform a search for the tags and selects random samples; the tag query is an AND/OR query (','=or, '+'=and).")
            .option('-a, --all', 'Show all samples which match the query (instead of the default random selection)')
            .option('-t, --tag <label>', 'Tag label for a query inside the configuration (see config set Tags <label> <query>.',(_.isObject(config_tags)?Object.keys(config_tags):null))
            .action(this._getActionFn('lookup',()=>{

                if(!SamplesMgr.hasSamplesIndex()){
                    UI.print("Lookup command: no samples scan found; perform a scan before this command");
                    return this._error_code;
                }

                let tagString=null;

                if(this.cli_params.hasOption('tag')){
                    tagString= this.cli_params.getOption('tag');
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

                let random = !this.cli_params.hasOption('all');
                let smp_obj = SamplesMgr.searchSamplesByTags(tagString,random);
                if(!smp_obj || smp_obj.error()){
                    UI.print("Lookup command: sample search failed");
                    return this._error_code;
                }

                smp_obj.print();

                if(this.cli_params.hasOption('all')){
                    // Print all samples

                }else{
                    // Filter randomly

                }
            }));
    }


    C_Config(){

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


    C_Scan(){
        vorpal
            .command('scan')
            .description("Perform a full scan of the samples directory. " +
                "In order to avoid resource wasting, if the index is already present the scan does not start.")
            .option('-f, --force', 'Force the rescan.')
            .action(this._getActionFn('scan',()=>{
                let C_scan_options = {
                    printFn: function(s){ UI.print(s); },
                    force:   this.cli_params.hasOption('force') //force scan
                };

                if(!this.cli_params.hasOption('force')){
                    if(SamplesMgr.sampleIndexFileExistsSync()){
                        UI.print("Scan command: the index file already exists. Use -f to force a rescan.");
                        return this._error_code;
                    }
                    C_scan_options.force = true;
                }

                let smp_obj = SamplesMgr.setSamplesIndex(C_scan_options);
                if(!_.isObject(smp_obj) || smp_obj.empty()){
                    UI.print("Scan command: job failed");
                    return this._error_code;
                }
                UI.print("Scan command: job completed ("+smp_obj.size()+" samples found)");
                return smp_obj;
            }));
    }


    C_Show(){
        vorpal
            .command('show <label>')
            .description('Show internal data [values: config, samples].')
            .autocomplete(['config','samples'])
            .action(this._getActionFn('show',()=>{
                let label = this.cli_params.get('label');
                if(label == 'config'){
                    ConfigMgr.print();
                    console.log("\n");
                    ConfigMgr.printInternals();
                    return this._success_code;
                }
                if(label == 'samples'){
                    SamplesMgr.printSamplesTree();
                    return this._success_code;
                }
                return this._error_code;
            }));
    }

};

module.exports = new CliManager();
