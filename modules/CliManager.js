const CliParams = require('./CliParams.class.js');
const vorpal = require('vorpal')();
const readlineSync = require('readline-sync');

class CliManager {

    constructor(){
        //this.ui_log = vorpal.log;
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
        ConfigMgr.printMessages();
        vorpal
            .delimiter('mpl$')
            .show();
    }

    _setCliCommandManagers(){
        this.C_Lookup();
        this.C_Save(); //TODO (add feature)
        //this.C_Bookmarks(); //TODO
        this.C_Coverage();
        this.C_Scan();
        this.C_Show();
        //this.C_Export(); //TODO
        this.C_Dir();
        this.C_Config_Set();
    }

    _getActionFn(cmdName, cmdFn){
        return (args,callback)=>{
            this.processParams(args,cmdName);
            let cmdFnResult = cmdFn();

            if(_.isPromise(cmdFnResult)){
                cmdFnResult.then((d)=>{
                    ConfigMgr.printMessages();
                    callback();

                }).catch((e)=>{
                    clUI.print("\n");
                    d$('_getActionFn',e);
                    callback();
                })
                return;
            }

            ConfigMgr.printMessages();
            callback();
        };
    }

    readLine(){
        return readlineSync.prompt();
    }

    waitForEnter(msg){
        if(!_.isString(msg)) msg='[press any key to continue]';
        readlineSync.question(msg,{
            defaultInput: ''
        });
    }

    questionYesNo(msg){
        if(!_.isString(msg)) msg='Do you want to continue?';
        let ans = readlineSync.question("\n"+msg+' [y/n] ',{
            defaultInput: ''
        });
        // console.log("\n"+msg+' [y/n] ');
        // let ans = scanf("%s");
        if(_.toLower(ans)==='y') return true;
        if(_.toLower(ans)==='n') return false;
        return null;
    }


    C_Coverage(){
        let config_tags = ConfigMgr.get('Tags');
        vorpal
            .command('coverage')
            .description('Check the coverage of samples in according to the tag labels present in the configuration.')
            .option('-p, --path <path>', 'Custom absolute path.')
            .option('-q, --query <query>', 'Custom query; e.g.\'tag1+tag2,tag3\'.')
            .option('-t, --tag <label>', 'Tag label for a query inside the configuration (see config set Tags <label> <query>)',(_.isObject(config_tags)?Object.keys(config_tags):null))
            .option('-a, --allinfo', 'Shows also the covered files.')
            .option('-g, --progressive', 'Shows the results step-by-step.')
            .action(this._getActionFn('coverage',()=>{
                let _clUI = clUI.newLocalUI('> coverage:');

                // TODO
                // -lt -gt per selezionare samples poco o troppo coperti
                // -t query label

                let C_coverage_options = {
                    path:null,        //custom path
                    query:null,       //query tags
                    tag:'',           //query tags

                    allinfo:this.cli_params.hasOption('allinfo'),
                    progressive:this.cli_params.hasOption('progressive')
                };

                /* PATH */
                C_coverage_options.path = this.cli_params.getOption('path');
                if(!_.isString(C_coverage_options.path)){
                    if(!SamplesMgr.hasSamplesIndex()){
                        _clUI.print("no samples index found;\n" +
                            "perform a scan or specify an absolute path with -p option.");
                        return this._error_code;
                    }
                }else if(!Utils.File.isAbsoluteParentDirSync(C_coverage_options.path) || !Utils.File.directoryExistsSync(C_coverage_options.path)){
                    // check path if is a good absolute path and exists
                    _clUI.print("path is not an absolute path or it does not exists.");
                    return this._error_code;
                }

                /* QUERY */
                C_coverage_options.query = this.cli_params.getOption('query');
                C_coverage_options.tag = this.cli_params.getOption('tag');
                if(!C_coverage_options.query){
                    if(!ConfigMgr.get('Tags')){
                        _clUI.print("no configured tags found.\n" +
                            "Add one or more tags to the configuration or specify a custom query with -q option.");
                        return this._error_code;
                    }
                    if(_.isString(C_coverage_options.tag) && !ConfigMgr.get('Tags')[C_coverage_options.tag]){
                        _clUI.print("tag with label '"+C_coverage_options.tag+"' not found.");
                        return this._error_code;
                    }
                }

                let smp_obj = SamplesMgr.checkSamplesCoverage(C_coverage_options);
                if(smp_obj===null || (_.isObject(smp_obj) && smp_obj.error())){
                    _clUI.print("something went wrong.");
                    return this._error_code;
                }

                return this._success_code;
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
            //.option('-b, --bookm', 'Save samples in the bookmarks splitted by tags.')
            .action(_self._getActionFn('save',()=>{
                let _clUI = clUI.newLocalUI('> save:');

                if(!ConfigMgr.path('project_directory')){
                    _clUI.print("project directory is not set; check the configuration.");
                    return this._error_code;
                }

                let smp_obj = SamplesMgr.getLatestLookup();
                if(!_.isObject(smp_obj)){
                    _clUI.print("latest lookup missing.");
                    return this._error_code;
                }

                let C_save_options = {
                    dirname:    this.cli_params.getOption('dirname'),       //custom name
                    overwrite:   this.cli_params.getOption('overwrite'),    //force overwrite
                    path:    this.cli_params.getOption('path')              //absolute path
                };

                // check path if is a good absolute path and exists
                if(_.isString(C_save_options.path) && !Utils.File.isAbsoluteParentDirSync(C_save_options.path,true)){
                    _clUI.print("path is not an absolute path or it does not exists.");
                    return this._error_code;
                }

                return SamplesMgr.generateSamplesDir(smp_obj,C_save_options).then(function(smp_copied_obj){
                    if(!_.isObject(smp_copied_obj)){
                        _clUI.print("no file saved [error#1].");
                        return;
                    }
                    if(smp_copied_obj.size()===0){
                        _clUI.print("no file saved.");
                        return;
                    }
                    smp_copied_obj.print();
                    _clUI.print(""+smp_copied_obj.size()+"/"+smp_obj.size()+" files saved.");

                }).catch(()=>{
                    _clUI.print("no file saved [error#2].");
                });
            }));
    }


    C_Lookup(){
        let config_tags = ConfigMgr.get('Tags');
        vorpal
            .command('lookup [query]')
            .description("Perform a search for the tags and selects random samples; the tag query is an AND/OR query (','=or, '+'=and).")
            .option('-a, --all', 'Show all samples which match the query (instead of the default random selection)')
            .option('-t, --tag <label>', 'Tag label for a query inside the configuration (see config set Tags <label> <query>)',(_.isObject(config_tags)?Object.keys(config_tags):null))
            .action(this._getActionFn('lookup',()=>{
                let _clUI = clUI.newLocalUI('> lookup:');

                if(!SamplesMgr.hasSamplesIndex()){
                    _clUI.print("no samples scan found; perform a scan before this command");
                    return this._error_code;
                }

                let tagString=null;

                if(this.cli_params.hasOption('tag')){
                    tagString= this.cli_params.getOption('tag');
                    if(!tagString){
                        _clUI.print("empty tag label");
                        return this._error_code;
                    }
                    tagString = ConfigMgr.get('Tags')[tagString];
                    if(_.isNil(tagString)){
                        _clUI.print("unknown tag label after");
                        return this._error_code;
                    }
                }else{
                    tagString = this.cli_params.get('query');
                }

                if(!_.isString(tagString) || tagString.length<1){
                    _clUI.print("empty tag list");
                    return this._error_code;
                }

                let random = !this.cli_params.hasOption('all');
                let smp_obj = SamplesMgr.searchSamplesByTags(tagString,random);
                if(_.isNil(smp_obj)){
                    _clUI.print("no samples found");
                    return this._success_code;
                }
                if(smp_obj.error()){
                    _clUI.print("sample search failed");
                    return this._error_code;
                }

                smp_obj.print();
                return this._success_code;
            }));
    }


    C_Bookmarks(){
        /*
        bookm -a                // show all bookmarks
        bookm                   // show and works latest lookup
        bookm -t hihat          // show all bookmarks with this label (autocomplete)
        bookm 1,4,7             // set bookmarks to default label
        bookm 1,4,7 -t hihat    // set bookmarks to the specified label (autocomplete)
        bookm 1,2,3 -r          // remove bookmarks
        bookm -r -t hihat       // remove all bookmarks with the specified label (autocomplete)
        bookm 1,2,3 -r -t hihat // remove bookmarks to the specified label (autocomplete)
        save  -b,--bookm
        */
        vorpal
            .command('bookm show')
            .description("Prints the samples collection to work with in the next command 'bookm set'.")
            .option('-a, --all', 'Shows all the bookmarks')
            .option('-l, --lookup', 'Shows the latest lookup')
            .option('-t, --tag <label>', 'Shows the bookmarks under the specified custom label')
            .action(this._getActionFn('bookm show',()=>{
                //let _clUI = clUI.newLocalUI('> bookm:');
                let C_bookm_options = {
                    all:this.cli_params.getOption('all'),
                    lookup:this.cli_params.getOption('lookup'),
                    tag:this.cli_params.getOption('tag')
                };
                BookmarksMgr.show(C_bookm_options);
                return this._success_code;
            }));

        vorpal
            .command('bookm set [ids...]')
            .description("Add or remove samples to the bookmarks.")
            .option('-t, --tag <label>', 'Put samples under the specified custom label')
            .option('-r, --remove', 'Remove bookmarks')
            .action(this._getActionFn('bookm set',()=>{
                //let _clUI = clUI.newLocalUI('> bookm:');
                let C_bookm_options = {
                    tag:this.cli_params.getOption('tag'),
                    remove:this.cli_params.hasOption('remove'),
                };
                BookmarksMgr.set(this.cli_params.get('ids'), C_bookm_options);
                return this._success_code;
            }));
    }


    C_Config_Set(){
        vorpal
            .command('config set <name> [values...]')
            .autocomplete(ConfigMgr.getConfigParams())
            .description("Set the value of a configuration parameter." +
                        "\n  $ config set Project /musicprojects/project1 / (or path)" +
                        "\n  $ config set Tag tag-label query,tag+tag2,or,tag3" +
                        "\n  $ config set ExtensionCheckForSamples I[, E, X] (included/excluded/disabled)" +
                        "\n  $ config set ExcludedExtensionsForSamples ext / (or .ext)" +
                        "\n  $ config set ExcludedExtensionsForSamples !ext / (or !.ext)")
            .action(this._getActionFn('config',()=>{
                let _clUI = clUI.newLocalUI('> config-set:');

                if(ConfigMgr.setFromCliParams(this.cli_params.get('name'),this.cli_params.get('values'))===null){
                    _clUI.print("configuration not changed");
                    return this._error_code;
                }
                if(ConfigMgr.save()!==true){
                    _clUI.print("error during file writing");
                    return this._error_code;
                }
                _clUI.print("configuration saved successfully");
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
                let _clUI = clUI.newLocalUI('> scan:');

                let C_scan_options = {
                    printFn: function(s){ _clUI.print(s); },
                    force:   this.cli_params.hasOption('force') //force scan
                };

                if(!this.cli_params.hasOption('force')){
                    if(SamplesMgr.sampleIndexFileExistsSync()){
                        _clUI.print("the index file already exists. Use -f to force a rescan.");
                        return this._error_code;
                    }
                    C_scan_options.force = true;
                }

                _clUI.print("indexing in progress...");
                let smp_obj = SamplesMgr.setSamplesIndex(C_scan_options);
                if(!_.isObject(smp_obj) || smp_obj.empty()){
                    _clUI.print("job failed");
                    return this._error_code;
                }
                _clUI.print(""+smp_obj.size()+" samples found");
                return smp_obj;
            }));
    }


    C_Show(){
        vorpal
            .command('show <label>')
            .description('Show internal data [values: config, samples].')
            .autocomplete(['config','samples'])
            .action(this._getActionFn('show',()=>{
                //let _clUI = clUI.newLocalUI('> show:');

                let label = this.cli_params.get('label');
                if(label === 'config'){
                    ConfigMgr.printInternals();
                    clUI.print("\n");
                    ConfigMgr.print();
                    return this._success_code;
                }
                if(label === 'samples'){
                    SamplesMgr.printSamplesTree();
                    return this._success_code;
                }
                return this._error_code;
            }));
    }


    C_Export(){
        /*
        // create config param ExportDir - warning if not set!

        export project      // zip, tar, etc.
        export bookm        // zip, tar, etc.
        */
        vorpal
            .command('export <type>')
            .description("Export project or samples data in a compressed archive. " +
                "Allowed values: project (export the project) and bookm (export bookmarks collection).")
            .option('-t, --type <type>', 'Archive type (zip, tar, gzip)')
            .action(this._getActionFn('export',()=>{
                //let _clUI = clUI.newLocalUI('> bookm:');
                let C_export_options = {
                    type:this.cli_params.getOption('type')
                };

                //ExportMgr.set(this.cli_params.get('ids'), C_bookm_options);
                return this._success_code;
            }));
    }


    C_Dir(){
        vorpal
            .command('dir <action>')
            .description('Some useful actions with the working directories (e.g. Samples, Project, etc.)'+
                "\n  $ dir ext  / show the full list of extensions and useful stats"+
                "\n  $ dir ext -e exe  / show the full list of file with the specified extension")
            .option('-e, --extension <name>', 'Focus on the specified extension.')
            .option('-i, --index', 'Works with the internal samples index')
            .autocomplete(['ext'])
            //.option('-f, --force', 'Force the rescan.')
            .action(this._getActionFn('dir',()=>{
                let _clUI  = clUI.newLocalUI('> dir:');
                let action = this.cli_params.get('action');
                if(action === 'ext'){
                    DirCommand.listExtensionsStats({
                        extension:this.cli_params.getOption('extension'),
                        index:this.cli_params.hasOption('index')
                    });
                    return this._success_code;
                }
                return this._error_code;
            }));
    }

};

module.exports = new CliManager();
