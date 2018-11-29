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
        this.C_Bookmarks();
        this.C_Config();
        this.C_Coverage();
        this.C_Dir();
        this.C_Export();
        this.C_Lookup();
        this.C_Project();
        this.C_Samples();
        this.C_Save();
        this.C_Scan();
        this.C_TQuery();
    }

    _getActionFn(cmdName, cmdFn){
        const thisCliMgr = this;
        return function(args,cb){
            const cliReference = this;

            thisCliMgr.processParams(args,cmdName);
            cmdFn(cliReference,(code,err)=>{
                if(code===thisCliMgr._error_code){
                    d$('command',cmdName,'terminated with an error.');
                    if(err) d$(err);
                }
                ConfigMgr.printMessages();
                clUI.print(' ');//new line before the prompt
                cb();
            });
        };
    }


    C_Coverage(){
        vorpal
            .command('coverage')
            .description('Check the coverage of samples in according to the tag labels present in the configuration.'+"\n")
            .option('-p, --path <path>', 'Custom absolute path.')
            .option('-q, --query <query>', 'Custom query; e.g.\'tag1+tag2,tag3\'.')
            .option('-t, --tag <tag>', 'Tag for a query inside the configuration (see config set Tags <tag> <query>)',TQueryMgr.getTags())
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
                    if(TQueryMgr.empty()){
                        _clUI.print("no tagged queries found.\n" +
                            "Add one or more tagged query to the configuration or specify a custom query with -q option.");
                        return cliNextCb(this._error_code);
                    }
                    if(_.isString(C_coverage_options.tag) && !TQueryMgr.get(C_coverage_options.tag)){
                        _clUI.print("query with tag '"+C_coverage_options.tag+"' not found.");
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
                        return cliNextCb(this._success_code);
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
                    return cliNextCb(this._success_code);
                };

                showCoverageOutput(0);
            }));
    }


    C_Save(){
        const _self = this;
        vorpal
            .command('save')
            .description('Create a directory with the samples previously found; the directory name is set automatically with some tag names.'+"\n")
            .option('-d, --dirname <dirname>', 'Save in a directory with a custom name.')
            .option('-p, --path <path>', 'Absolute custom path.')
            .option('-o, --overwrite', 'Overwrite the existent directory.')
            //.option('-b, --bookm', 'Save samples in the bookmarks splitted by tags.')
            .action(_self._getActionFn('save', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> save:');

                if(!ProjectsMgr.current){
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

                let _self = this;
                cliReference.prompt({
                    type: 'input',
                    name: 'answer',
                    message: 'Do you want to proceed? [y/n] '
                }, function (result) {
                    if(result.answer !== 'y'){
                        return cliNextCb(_self._success_code);
                    }
                    SamplesMgr.generateSamplesDir(smp_obj,C_save_options).then(function(smp_copied_obj){
                        if(!_.isObject(smp_copied_obj)){
                            _clUI.print("no file saved [error#1].");
                            return cliNextCb(_self._error_code);
                        }
                        if(smp_copied_obj.size()===0){
                            _clUI.print("no file saved.");
                            return cliNextCb(_self._error_code);
                        }
                        smp_copied_obj.print();
                        _clUI.print(""+smp_copied_obj.size()+"/"+smp_obj.size()+" files saved.");
                        return cliNextCb(_self._success_code);

                    }).catch(()=>{
                        _clUI.print("no file saved [error#2].");
                        return cliNextCb(_self._error_code);
                    });
                });
            }));
    }


    C_Lookup(){
        vorpal
            .command('lookup [query]')
            .description("Perform a search for the tags and selects random samples; the tag query is an AND/OR query (','=or, '+'=and)."+"\n")
            .option('-a, --all', 'Show all samples which match the query (instead of the default random selection)')
            .option('-t, --tag <tag>', 'Tag for a query inside the configuration (see config set Tags <tag> <query>)',TQueryMgr.getTags())
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
                        _clUI.print("empty tag");
                        return cliNextCb(this._error_code);
                    }
                    tagString = TQueryMgr.get(tagString);
                    if(_.isNil(tagString)){
                        _clUI.print("unknown tag");
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
        vorpal
            .command('bookm')
            .description("Prints the samples collection to work with in the next command 'bookm set'."+"\n")
            .option('-a, --all', 'Shows all the bookmarks')
            .option('-l, --lookup', 'Shows the latest lookup')
            .option('-t, --tag <tag>', 'Shows the bookmarks under the specified custom tag')
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

                BookmarksMgr.workingSet(C_bookm_options); //get and set internal working set

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
                        BookmarksMgr.set(addIds, removeIds, bookmLabel, C_bookm_options.tag);
                        return p1();
                    });
                };
                p1();
            }));
    }


    C_Config(){
        vorpal
            .command('config [name] [values...]')
            .autocomplete(ConfigMgr.getConfigParams())
            .description("Get or set the value of a configuration parameter." +
                        "\n  $ config / print the whole config and internal data" +
                        "\n  $ config ExtensionCheckForSamples I[, E, X] (included/excluded/disabled)" +
                        "\n  $ config ExcludedExtensionsForSamples ext / (or .ext)" +
                        "\n  $ config ExcludedExtensionsForSamples !ext / (or !.ext)"+"\n")
            .action(this._getActionFn('config', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> config:');

                if(_.isNil(this.cli_params.get('name'))){
                    ConfigMgr.printInternals();
                    clUI.print("\n");
                    ConfigMgr.print();
                    return cliNextCb(this._success_code);
                }

                if(_.isNil(this.cli_params.get('values'))){
                    if(_.isNil(ConfigMgr.get(this.cli_params.get('name')))){
                        _clUI.print('this parameter does not exist.');
                        return cliNextCb(this._error_code);
                    }
                    clUI.print(ConfigMgr.get(this.cli_params.get('name')));
                    return cliNextCb(this._success_code);
                }

                if(ConfigMgr.setFromCliParams(this.cli_params.get('name'),this.cli_params.get('values'))===null){
                    _clUI.print("configuration not changed");
                    return cliNextCb(this._error_code);
                }
                if(ConfigMgr.save()!==true){
                    _clUI.print("error during file writing");
                    return cliNextCb(this._error_code);
                }
                ConfigMgr.print();
                clUI.print('');
                _clUI.print("configuration saved successfully");
                return cliNextCb(this._success_code);
            }));
    }


    C_Scan(){
        vorpal
            .command('scan')
            .description("Perform a full scan of the samples directory. " +
                "In order to avoid resource wasting, if the index is already present the scan does not start."+"\n")
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
                return cliNextCb(this._success_code);
            }));
    }


    C_Project(){
        vorpal
            .command('project')
            .description('Project manager (project path, default templates, history, etc.)'+
                "\n  $ project                                  / shows current project"+
                "\n  $ project -p \"/absolute/path/project/\"   / shows current project"+
                "\n  $ project -d                               / shows default templates"+
                "\n  $ project -d name                          / set new default template"+
                "\n  $ project -d !name                         / remove a default template"+
                "\n")
            .option('-p, --path <path>', 'Set current project from its absolute path')
            .option('-h, --history', 'Set current project by choosing a project from history')
            .option('-d, --default [default]', "View default projects; if a name is specified, "+
                                                "store the current project as default project or delete a default project")
            .option('-n, --new <default>', 'Create a new project from a default project')
            .action(this._getActionFn('project', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> project:');
                _clUI.print("[current]",ProjectsMgr.current);

                let C_Project_options = {
                    path: this.cli_params.getOption('path'),
                    history: this.cli_params.hasOption('history'),
                    default_flag: this.cli_params.hasOption('default'),
                    default_value: this.cli_params.getOption('default'),
                    new: this.cli_params.getOption('new')
                };

                // Set current project from absolute path
                if(_.isString(C_Project_options.path) && C_Project_options.path.length>1){
                    if(!Utils.File.directoryExistsSync(C_Project_options.path)){
                        _clUI.print("this project path does not exist");
                        return cliNextCb(this._error_code);
                    }
                    ProjectsMgr.current = C_Project_options.path;
                    ProjectsMgr.save();
                    _clUI.print("[new]",ProjectsMgr.current);
                    return cliNextCb(this._success_code);
                }

                // Set current project from history
                if(C_Project_options.history === true){
                    if(!ProjectsMgr.history.printIndexedList(function(v){
                            clUI.print(v);
                        })){
                        _clUI.print('Projects history is empty.');
                        return cliNextCb(this._success_code);
                    }
                    cliReference.prompt({
                        type: 'input',
                        name: 'index',
                        message: "['q' to quit] > "
                    }, (result)=>{
                        if(result.index !== 'q'){
                            let phistory = ProjectsMgr.history.get(parseInt(result.index)-1);
                            if(!phistory){
                                _clUI.print("index out of bounds");
                            }else{
                                if(!Utils.File.directoryExistsSync(phistory)){
                                    _clUI.print("this project path does not exist!");
                                    ProjectsMgr.history.remove(phistory);
                                    return cliNextCb(this._error_code);
                                }
                                ProjectsMgr.current = phistory;
                                ProjectsMgr.save();
                                _clUI.print("[new]",ProjectsMgr.current);
                            }
                        }
                        return cliNextCb(this._success_code);
                    });
                    return;
                }

                // Default projects
                if(C_Project_options.default_flag===true){
                    if(_.isString(C_Project_options.default_value) && C_Project_options.default_value.length>1){
                        C_Project_options.default_value = _.trim(C_Project_options.default_value);

                        /* Remove default template */
                        if(C_Project_options.default_value.startsWith('!')){
                            C_Project_options.default_value = C_Project_options.default_value.substring(1);
                            let defaultTemplate = ProjectsMgr.template.get(C_Project_options.default_value);
                            if(!defaultTemplate) {
                                _clUI.print("Default template",C_Project_options.default_value,"not found");
                                return cliNextCb(this._error_code);
                            }

                            _clUI.print("The template",C_Project_options.default_value,"inside the directory",defaultTemplate,"will be removed.");
                            cliReference.prompt({
                                type: 'input',
                                name: 'answer',
                                message: "Do you want to proceed? [y/n] "
                            }, (result)=>{
                                if(result.answer === 'y'){
                                    if(ProjectsMgr.template.remove(defaultTemplate)!==true){
                                        _clUI.print("Cannot remove the default template");
                                        return cliNextCb(this._error_code);
                                    }else{
                                        ProjectsMgr.save();
                                    }
                                }
                                return cliNextCb(this._success_code);
                            });
                            return;
                        }

                        /* New default template */
                        if(!ProjectsMgr.current){
                            _clUI.print("No current project set");
                            return cliNextCb(this._success_code);
                        }
                        _clUI.print("The current project","'"+ProjectsMgr.current+"'"," will be stored as template in",ProjectsMgr.template.dir);
                        cliReference.prompt({
                            type: 'input',
                            name: 'answer',
                            message: "Do you want to proceed? [y/n] "
                        }, (result)=>{
                            if(result.answer === 'y'){
                                ProjectsMgr.template.add(C_Project_options.default_value, ProjectsMgr.current).then((template)=>{
                                    _clUI.print("New project template: ",template.template_path);
                                    ProjectsMgr.save();
                                    return cliNextCb(this._success_code);
                                }).catch((e)=>{
                                    d$(e);
                                    _clUI.print("Unexpected error",e.message);
                                    return cliNextCb(this._error_code);
                                });
                            }
                            return cliNextCb(this._success_code);
                        });
                        return;
                    }

                    if(!ProjectsMgr.template.printIndexedList(function(v){
                            clUI.print(v);
                        })){
                        _clUI.print('No project templates available.');
                    }
                    return cliNextCb(this._success_code);
                }

                // New project from default
                if(_.isString(C_Project_options.new) && C_Project_options.new.length>1){
                    if(!ProjectsMgr.template.printIndexedList(function(v){
                            clUI.print(v);
                        })){
                        _clUI.print('No project templates available.');
                        return cliNextCb(this._success_code);
                    }
                    cliReference.prompt({
                        type: 'input',
                        name: 'index',
                        message: "['q' to quit] > "
                    }, (result)=>{
                        if(result.index !== 'q'){
                            let ptemplate = ProjectsMgr.template.get(parseInt(result.index)-1);
                            if(!ptemplate){
                                _clUI.print("index out of bounds");
                                return cliNextCb(this._error_code);
                            }

                            /* Choose project path */
                            let _projectPathList = ProjectsMgr.ppaths.printIndexedList(ProjectsMgr.current,function(v){
                                clUI.print(v);
                            });
                            cliReference.prompt({
                                type: 'input',
                                name: 'index',
                                message: "Write "+(_.isArray(_projectPathList)?"or choose":"")+" an absolute path ['q' to quit] > "
                            }, (result)=>{
                                if(result.index !== 'q') {
                                    let project_path = null;
                                    let _index = parseInt(result.index);

                                    // Get by index
                                    if(_.isNumber(_index) && _index<=_projectPathList.length && _index>0) project_path=_projectPathList[_index-1];
                                    if (!project_path) {
                                        _clUI.print("index out of bounds");
                                        return cliNextCb(this._error_code);
                                    }

                                    // Get by path
                                    if(Utils.File.directoryExistsSync(result.index)) project_path=result.index;
                                    if (!project_path) {
                                        _clUI.print("path does not exist ",result.index);
                                        return cliNextCb(this._error_code);
                                    }

                                    _clUI.print("\nA new project in",Utils.File.pathJoin(project_path,C_Project_options.new),
                                        " will be created starting from the template",ptemplate);

                                    // New project from template
                                    cliReference.prompt({
                                        type: 'input',
                                        name: 'answer',
                                        message: "Do you want to proceed? [y/n] "
                                    }, (result)=>{
                                        if(result.answer === 'y') {
                                            ProjectsMgr.template.newProject(ptemplate, project_path, C_Project_options.new).then((data)=>{
                                                ProjectsMgr.current = data.project_path;
                                                ProjectsMgr.save();
                                                _clUI.print("[new current project]",ProjectsMgr.current);
                                                return cliNextCb(this._success_code);

                                            }).catch((e)=>{
                                                d$(e);
                                                _clUI.print("Unexpected error",e.message);
                                                return cliNextCb(this._error_code);
                                            });
                                            return;
                                        }
                                        return cliNextCb(this._success_code);
                                    });
                                }
                                return cliNextCb(this._success_code);
                            });
                            return;
                        }
                        return cliNextCb(this._success_code);
                    });
                    return;
                }

                return cliNextCb(this._success_code);
            }));
    }


    C_TQuery(){
        vorpal
            .command('tquery [tag] [query]')
            .description('Add, remove or view tagged queries (used by lookup -t <tag>)'+"\n")
            .option('-r, --remove', 'Remove the specified tag')
            .action(this._getActionFn('tquery', (cliReference,cliNextCb)=>{

                let _clUI = clUI.newLocalUI('> tquery:');
                let C_TQuery_options = {
                    tag:this.cli_params.get('tag'),
                    query:this.cli_params.get('query'),
                    remove:this.cli_params.hasOption('remove')
                };

                if(C_TQuery_options.tag && C_TQuery_options.query){
                    if(TQueryMgr.add(C_TQuery_options.tag,C_TQuery_options.query)){
                        _clUI.print('Tag',"'"+C_TQuery_options.tag+"'",'added succesfully');
                        TQueryMgr.save();
                    }else{
                        _clUI.print('Tag',"'"+C_TQuery_options.tag+"'",'not added');
                    }
                    return cliNextCb(this._success_code);
                }

                if(C_TQuery_options.tag){

                    // remove
                    if(C_TQuery_options.remove===true){
                        if(TQueryMgr.remove(C_TQuery_options.tag)){
                            _clUI.print('Tag',"'"+C_TQuery_options.tag+"'",'removed succesfully');
                            TQueryMgr.save();
                        }else{
                            _clUI.print('Tag',"'"+C_TQuery_options.tag+"'",'not removed');
                        }
                        return cliNextCb(this._success_code);
                    }

                    // get one tagged query
                    let tquery = TQueryMgr.get(C_TQuery_options.tag);
                    if(!tquery){
                        _clUI.print('Tag',"'"+C_TQuery_options.tag+"'",'does not exist');
                    }else{
                        _clUI.print('Tag',"'"+C_TQuery_options.tag+"'",'=',tquery);
                    }
                    return cliNextCb(this._success_code);
                }

                TQueryMgr.printList(function(tag,query){ clUI.print("\n  ",tag+':',query); });
                if(TQueryMgr.empty()){
                    _clUI.print("No tagged queries");
                }
                return cliNextCb(this._success_code);
            }));
    }


    C_Samples(){
        vorpal
            .command('samples')
            .description('Shows all the indexed samples.'+"\n")
            .action(this._getActionFn('samples', (cliReference,cliNextCb)=>{
                SamplesMgr.printSamplesTree();
                return cliNextCb(this._success_code);
            }));
    }


    C_Export(){
        vorpal
            .command('export <data>')
            .description("Export project or samples data in a compressed archive. " +
                "Allowed values: project (export the project) and bookm (export bookmarks collection)."+"\n")
            .autocomplete(['bookm','project'])
            //.option('-t, --type <type>', 'Archive type (zip, tar, gzip)')
            .action(this._getActionFn('export', (cliReference,cliNextCb)=>{
                let _clUI = clUI.newLocalUI('> export:');

                if(!ConfigMgr.path('export_directory')){
                    _clUI.print("no valid export directory; set an existent directory for data export.");
                    return cliNextCb(this._error_code);
                }

                let ExportFn = null;
                let C_export_options = {
                    param_data:this.cli_params.get('data'),
                };
                let archFD_options = {
                    sourcePath:null,
                    destPath:ConfigMgr.path('export_directory')
                };

                if(C_export_options.param_data === 'project'){
                    if(ProjectsMgr.current){
                        _clUI.print("no valid project directory; set an existent project directory.");
                        return cliNextCb(this._error_code);
                    }
                    archFD_options.sourcePath = ProjectsMgr.current;
                    ExportFn = function(opt){
                        _clUI.print("exporting the project "+ProjectsMgr.current+"\n          to "+archFD_options.destPath+" ...");
                        return ExportMgr.exportProject(opt);
                    };
                }

                else if(C_export_options.param_data === 'bookm'){
                    if(!BookmarksMgr.hasBookmarks()){
                        _clUI.print("your bookmarks collection is empty.");
                        return cliNextCb(this._error_code);
                    }
                    ExportFn = function(opt){
                        _clUI.print("exporting bookmarks to "+archFD_options.destPath+" ...");
                        return ExportMgr.exportBookmarks(opt);
                    };
                }

                if(!_.isFunction(ExportFn)) return cliNextCb(this._error_code);

                ExportFn(archFD_options).then((d)=>{
                    _clUI.print("exported "+d.total_bytes+"B to "+d.archive_path);
                    return cliNextCb(this._success_code);
                }).catch((e)=>{
                    _clUI.warning("error while creating and exporting the archive");
                    _clUI.warning(e.code,e.message);
                    return cliNextCb(this._error_code);
                });

            }));
    }


    C_Dir(){
        vorpal
            .command('dir <action>')
            .description('Some useful actions with the working directories (e.g. Samples, Project, etc.)'+
                "\n  $ dir ext  / show the full list of extensions and useful stats"+
                "\n  $ dir ext -e exe  / show the full list of file with the specified extension"+"\n")
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
