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
        this.C_Save();
        this.C_Coverage();
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


    C_Coverage(){
        vorpal
            .command('coverage')
            .description('Check the coverage of samples in according to the tag labels present in the configuration.')
            .option('-d, --directory <directory>', 'External absolute path.')
            .option('-q, --query <query>', 'Custom query on tags; e.g.\'tag1+tag2,tag3\'.')
            .option('-c, --covered', 'Get the covered tags (by default, the uncovered tags are returned).')
            .option('-p, --progressive', 'Stops when some files which did not pass the check are found.')
            .option('-k, --prog-keepalive', 'Like --progressive but it keeps the command alive waiting for key \'enter\'.')
            .action(this._getActionFn('coverage',()=>{
                let C_coverage_options = {
                    dirPath:null,       //custom path
                    tagQuery:null,      //query tags
                    lookingForCoverage:false,
                    consoleOutput:true,
                    progressive:false,
                    progressive_keepalive:false
                };

                C_coverage_options.dirPath = this.cli_params.getOption('directory');
                if(!C_coverage_options.dirPath){
                    if(!SamplesMgr.sampleScanFileExists()){
                        UI.print("Coverage command: the index file does not exist.\n" +
                            "Perform a scan or specify an absolute path with -p option.");
                        return this._error_code;
                    }
                }

                C_coverage_options.tagQuery = this.cli_params.getOption('query');
                if(!C_coverage_options.tagQuery){
                    if(!ConfigMgr.get('Tags')){
                        UI.print("Coverage command: no configured tags found.\n" +
                            "Add one or more tags to the configuration or specify a custom query with -q option.");
                        return this._error_code;
                    }
                }

                C_coverage_options.lookingForCoverage = this.cli_params.hasOption('covered');
                C_coverage_options.progressive = this.cli_params.hasOption('progressive');
                C_coverage_options.progressive_keepalive = this.cli_params.hasOption('prog-keepalive');

                let smp_obj = SamplesMgr.checkSamplesCoverage(C_coverage_options);
                if(!_.isObject(smp_obj)){
                    UI.print("Coverage command: something went wrong.");
                    return this._error_code;
                }

                return smp_obj;
            }));
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

                if(!this.cli_params.hasOption('force')){
                    if(SamplesMgr.sampleScanFileExists()){
                        UI.print("Scan command: the index file already exists. Use -f to force a rescan.");
                        return this._error_code;
                    }
                }else{
                    C_scan_options.force = true;
                }

                C_scan_options.printFn = function(s){ UI.print(s); };

                let smp_obj = SamplesMgr.scanSamples(null,C_scan_options);
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


    C_Save(){
        vorpal
            .command('save')
            .description('Create a directory with the samples previously found; the directory name is set automatically with some tag names.')
            .option('-n, --name <path>', 'Save in a directory with a custom name.')
            .option('-o, --overwrite', 'Overwrite the existent directory.')
            .action(this._getActionFn('save',()=>{
                let smp_dirname = null;
                let C_save_options = {
                    dirname:null,   //custom name
                    forcedir:false, //force overwrite
                    smppath:null    //absolute path
                };

                if(!ConfigMgr.path('project_directory')){
                    UI.print("Save command: project directory is not set; check the configuration.");
                    return this._error_code;
                }

                C_save_options.dirname = this.cli_params.getOption('name');
                C_save_options.forcedir = this.cli_params.getOption('overwrite');

                let smp_obj = SamplesMgr.openLookupFile();
                if(!_.isObject(smp_obj)){
                    UI.print("Save command: latest lookup missing");
                    return this._error_code;
                }
                return SamplesMgr.generateSamplesDir(smp_obj,C_save_options);
            }));
    }


    C_Config(){
        vorpal
            .command('config show')
            .description('Show the configuration.')
            .option('-i, --internals', 'Show internal configuration data.')
            .action(this._getActionFn('config',()=>{
                if(this.cli_params.hasOption('internals')) ConfigMgr.printInternals();
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
