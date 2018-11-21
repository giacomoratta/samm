const CliParams = require('./CliParams.class.js');
const vorpal = require('vorpal')();

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
        this.C_Bookmarks(); //TODO
        this.C_Coverage();
        this.C_Scan();
        this.C_Show();
        //this.C_Export(); //TODO
        this.C_Dir();
        this.C_Config_Set();
    }

    _getActionFn(cmdName, cmdFn){
        const thisCliMgr = this;
        return function(args,cb){
            const cliReference = this;
            // cliReference.prompt({
            //     type: 'input',
            //     name: 'time',
            //     message: 'When would you like your pizza?'
            // }, function (result) {
            //     cliReference.log(`Okay, ${result.time} it is!`);
            //
            //     cliReference.prompt({
            //         type: 'input',
            //         name: 'time',
            //         message: 'Whffffffen would you like your pizza?'
            //     }, function (result) {
            //         cliReference.log(`Okay, ${result.time} it is!`);
            //         cb();
            //     });
            // });
            //
            // return;

            thisCliMgr.processParams(args,cmdName);
            cmdFn(cliReference,(cmdFnResult)=>{
                if(_.isPromise(cmdFnResult)){
                    cmdFnResult.then((d)=>{
                        ConfigMgr.printMessages();
                        cb();

                    }).catch((e)=>{
                        clUI.print("\n");
                        d$('_getActionFn',e);
                        cb();
                    });
                    return;
                }
                ConfigMgr.printMessages();
                cb();
            });
        };
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
            .action(this._getActionFn('coverage', (cliReference,cliNextCb)=>{
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
                        return cliNextCb(this._error_code);
                    }
                }else if(!Utils.File.isAbsoluteParentDirSync(C_coverage_options.path) || !Utils.File.directoryExistsSync(C_coverage_options.path)){
                    // check path if is a good absolute path and exists
                    _clUI.print("path is not an absolute path or it does not exists.");
                    return cliNextCb(this._error_code);
                }

                /* QUERY */
                C_coverage_options.query = this.cli_params.getOption('query');
                C_coverage_options.tag = this.cli_params.getOption('tag');
                if(!C_coverage_options.query){
                    if(!ConfigMgr.get('Tags')){
                        _clUI.print("no configured tags found.\n" +
                            "Add one or more tags to the configuration or specify a custom query with -q option.");
                        return cliNextCb(this._error_code);
                    }
                    if(_.isString(C_coverage_options.tag) && !ConfigMgr.get('Tags')[C_coverage_options.tag]){
                        _clUI.print("tag with label '"+C_coverage_options.tag+"' not found.");
                        return cliNextCb(this._error_code);
                    }
                }

                // Check Coverage
                let cv_output = SamplesMgr.checkSamplesCoverage(C_coverage_options);
                if(cv_output===null || (_.isObject(cv_output) && cv_output.error===true)){
                    _clUI.print("something went wrong.");
                    return cliNextCb(this._error_code);
                }

                // OUTPUT(s)
                let showCoverageOutput = (i)=>{
                    if(i<0 || !cv_output.array[i]){
                        showUncoverageOutput();
                        return;
                    }
                    clUI.print(cv_output.array[i].output_line);
                    if(C_coverage_options.allinfo){
                        cv_output.array[i].smpobj.print();
                        clUI.print('');
                    }

                    if(C_coverage_options.progressive===true){
                        cliReference.prompt({
                            type: 'input',
                            name: 'action',
                            message: "['q' to quit] "
                        }, function(result){
                            if(result.action==='q'){
                                showUncoverageOutput();
                                return;
                            }
                            showCoverageOutput(i+1);
                        });
                        return;
                    }
                    showCoverageOutput(i+1);
                };

                let showUncoverageOutput = (showuncovered)=>{
                    clUI.print(cv_output.uncovered_output_line);
                    if(cv_output.uncovered_smpobj.size()<11 || showuncovered===true /*|| C_coverage_options.allinfo*/){
                        cv_output.uncovered_smpobj.print();
                        return cliNextCb(cv_output);
                    }
                    if(_.isNil(showuncovered)){
                        cliReference.prompt({
                            type: 'input',
                            name: 'show',
                            message: 'There are many uncovered samples. Do you want to show them? [y/n] '
                        }, function (result) {
                            showUncoverageOutput(result.show==='y');
                        });
                        return;
                    }
                    return cliNextCb(cv_output);
                };

                showCoverageOutput(0);
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
            .action(_self._getActionFn('save', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> save:');

                if(!ConfigMgr.path('project_directory')){
                    _clUI.print("project directory is not set; check the configuration.");
                    return cliNextCb(this._error_code);
                }

                let smp_obj = SamplesMgr.getLatestLookup();
                if(!_.isObject(smp_obj)){
                    _clUI.print("latest lookup missing.");
                    return cliNextCb(this._error_code);
                }

                let C_save_options = {
                    dirname:   this.cli_params.getOption('dirname'),      //custom name
                    overwrite: this.cli_params.getOption('overwrite'),    //force overwrite
                    path:      this.cli_params.getOption('path')          //absolute path
                };

                // check path if is a good absolute path and exists
                if(_.isString(C_save_options.path) && !Utils.File.isAbsoluteParentDirSync(C_save_options.path,true)){
                    _clUI.print("path is not an absolute path or it does not exists.");
                    return cliNextCb(this._error_code);
                }

                C_save_options = SamplesMgr.generateSamplesDir_setOptions(smp_obj,C_save_options);

                _clUI.print(""+smp_obj.size(),"samples will be saved in",C_save_options.path);
                if(C_save_options.overwrite) _clUI.print('... and this path will be overwritten!');
                clUI.print();

                cliReference.prompt({
                    type: 'input',
                    name: 'answer',
                    message: 'Do you want to proceed? [y/n] '
                }, function (result) {
                    if(result.answer !== 'y'){
                        return cliNextCb();
                    }
                    return cliNextCb(SamplesMgr.generateSamplesDir(smp_obj,C_save_options).then(function(smp_copied_obj){
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
                    }));
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
            .action(this._getActionFn('lookup', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> lookup:');

                if(!SamplesMgr.hasSamplesIndex()){
                    _clUI.print("no samples scan found; perform a scan before this command");
                    return cliNextCb(this._error_code);
                }

                let tagString=null;

                if(this.cli_params.hasOption('tag')){
                    tagString= this.cli_params.getOption('tag');
                    if(!tagString){
                        _clUI.print("empty tag label");
                        return cliNextCb(this._error_code);
                    }
                    tagString = ConfigMgr.get('Tags')[tagString];
                    if(_.isNil(tagString)){
                        _clUI.print("unknown tag label after");
                        return cliNextCb(this._error_code);
                    }
                }else{
                    tagString = this.cli_params.get('query');
                }

                if(!_.isString(tagString) || tagString.length<1){
                    _clUI.print("empty tag list");
                    return cliNextCb(this._error_code);
                }

                let random = !this.cli_params.hasOption('all');
                let smp_obj = SamplesMgr.searchSamplesByTags(tagString,random);
                if(_.isNil(smp_obj)){
                    _clUI.print("no samples found");
                    return cliNextCb(this._success_code);
                }
                if(smp_obj.error()){
                    _clUI.print("sample search failed");
                    return cliNextCb(this._error_code);
                }

                smp_obj.print();
                return cliNextCb(this._success_code);
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
        bookm
        */
        vorpal
            .command('bookm')
            .description("Prints the samples collection to work with in the next command 'bookm set'.")
            .option('-a, --all', 'Shows all the bookmarks')
            .option('-l, --lookup', 'Shows the latest lookup')
            .option('-t, --tag <label>', 'Shows the bookmarks under the specified custom label')
            .option('-s, --save', 'Save bookmarks in the current project')
            .action(this._getActionFn('bookm show', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> bookm:');
                let C_bookm_options = {
                    all:this.cli_params.hasOption('all'),
                    lookup:this.cli_params.hasOption('lookup'),
                    save:this.cli_params.hasOption('save'),
                    tag:this.cli_params.getOption('tag')
                };

                if(C_bookm_options.save===true){
                    // generateSamplesDir
                    return cliNextCb(this._success_code);
                }

                let matchAddId = function(v){
                    if(_.startsWith(v,'!')) return null;
                    let v1=Utils.strToInteger(v);
                    return (v1!==null?v1:null);
                };
                let matchRemoveId = function(v){
                    if(!_.startsWith(v,'!')) return null;
                    let v1=Utils.strToInteger(v.substring(1));
                    return (v1!==null?v1:null);
                };
                let matchLabel = function(v){
                    if(!(_.isString(v) && v.length>0)) return null;
                    if(matchAddId(v)===null && matchRemoveId(v)===null) return v;
                    return null;
                };


                let bookmWkSet = BookmarksMgr.workingSet(C_bookm_options); //get and set internal working set

                let p1 = ()=>{
                    if(!BookmarksMgr.printWorkingSet(
                        C_bookm_options,
                        function(msg){ _clUI.print(msg); },
                        function(msg){ clUI.print(msg); }
                    )){
                        return cliNextCb(this._success_code);
                    }

                    cliReference.prompt({
                        type: 'input',
                        name: 'clicmd',
                        message: "['q' to quit] > "
                    }, (result)=>{
                        let cliInput = new CliParams(result.clicmd, null, true);
                        let bookmLabel = cliInput.filterGet(0,matchLabel);
                        let addIds = cliInput.filterValues(matchAddId);
                        let removeIds = cliInput.filterValues(matchRemoveId);
                        if(result.clicmd === 'q'){
                            BookmarksMgr.save();
                            return cliNextCb(this._success_code);
                        }
                        BookmarksMgr.set(addIds, removeIds, bookmLabel);
                        return p1();
                    });
                };
                p1();
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
            .action(this._getActionFn('config', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> config-set:');

                if(ConfigMgr.setFromCliParams(this.cli_params.get('name'),this.cli_params.get('values'))===null){
                    _clUI.print("configuration not changed");
                    return cliNextCb(this._error_code);
                }
                if(ConfigMgr.save()!==true){
                    _clUI.print("error during file writing");
                    return cliNextCb(this._error_code);
                }
                _clUI.print("configuration saved successfully");
                ConfigMgr.print();
                return cliNextCb(this._success_code);
            }));
    }


    C_Scan(){
        vorpal
            .command('scan')
            .description("Perform a full scan of the samples directory. " +
                "In order to avoid resource wasting, if the index is already present the scan does not start.")
            .option('-f, --force', 'Force the rescan.')
            .action(this._getActionFn('scan', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> scan:');

                let C_scan_options = {
                    printFn: function(s){ _clUI.print(s); },
                    force:   this.cli_params.hasOption('force') //force scan
                };

                if(!this.cli_params.hasOption('force')){
                    if(SamplesMgr.sampleIndexFileExistsSync()){
                        _clUI.print("the index file already exists. Use -f to force a rescan.");
                        return cliNextCb(this._error_code);
                    }
                    C_scan_options.force = true;
                }

                _clUI.print("indexing in progress...");
                let smp_obj = SamplesMgr.setSamplesIndex(C_scan_options);
                if(!_.isObject(smp_obj) || smp_obj.empty()){
                    _clUI.print("job failed");
                    return cliNextCb(this._error_code);
                }
                _clUI.print(""+smp_obj.size()+" samples found");
                return cliNextCb(smp_obj);
            }));
    }


    C_Show(){
        vorpal
            .command('show <label>')
            .description('Show internal data [values: config, samples].')
            .autocomplete(['config','samples'])
            .action(this._getActionFn('show', (cliReference,cliNextCb)=>{
                //let _clUI = clUI.newLocalUI('> show:');
                let label = this.cli_params.get('label');
                if(label === 'config'){
                    ConfigMgr.printInternals();
                    clUI.print("\n");
                    ConfigMgr.print();
                    return cliNextCb(this._success_code);
                }
                if(label === 'samples'){
                    SamplesMgr.printSamplesTree();
                    return cliNextCb(this._success_code);
                }
                return cliNextCb(this._error_code);
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
            .action(this._getActionFn('export', (cliReference,cliNextCb)=>{
                //let _clUI = clUI.newLocalUI('> bookm:');
                let C_export_options = {
                    type:this.cli_params.getOption('type')
                };

                //ExportMgr.set(this.cli_params.get('ids'), C_bookm_options);
                return cliNextCb(this._success_code);
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
            .action(this._getActionFn('dir', (cliReference,cliNextCb)=>{
                let _clUI  = clUI.newLocalUI('> dir:');
                let action = this.cli_params.get('action');
                if(action === 'ext'){
                    DirCommand.listExtensionsStats({
                        extension:this.cli_params.getOption('extension'),
                        index:this.cli_params.hasOption('index')
                    });
                    return cliNextCb(this._success_code);
                }
                return cliNextCb(this._error_code);
            }));
    }

}

module.exports = new CliManager();
