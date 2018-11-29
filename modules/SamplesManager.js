class SamplesManager {

    constructor(){

        /* LABELS */
        this._LABEL_samples_index = 'samples_index';

        /* CACHES */
        this._CACHE_latest_smp_obj_search = null; //latest lookup
        this._CACHE_stqall = new DataCache(); //Sampleby_Tag_Query_ALL
        this._CACHE_stqrnd = new DataCache(); //Sampleby_Tag_Query_RANDOM

        /* DATA HOLDER */
        this._createIndexHolder({
                label: this._LABEL_samples_index,
                filePath: ConfigMgr.path('samples_index'),
                directoryToScan: ConfigMgr.path('samples_directory')
        });
    }

    _directoryTreeOptionsFromConfig(){
        let dTreeOptions = {
            /* DirectoryTree options */
        };
        if(ConfigMgr.get('ExtensionCheckForSamples')==='I') dTreeOptions.includedExtensions = ConfigMgr.get('IncludedExtensionsForSamples');
        else if(ConfigMgr.get('ExtensionCheckForSamples')==='E') dTreeOptions.excludedExtensions = ConfigMgr.get('ExcludedExtensionsForSamples');
        else{
            dTreeOptions.includedExtensions = null;
            dTreeOptions.excludedExtensions = null;
        }
        return dTreeOptions;
    }

    _createIndexHolder(options){
        let _self = this;
        let __new_SamplesTree = function(){
            let STree = new SamplesTree(options.directoryToScan,{
                /* SampleTree options */
            },_self._directoryTreeOptionsFromConfig());
            return STree;
        };

        return DataMgr.setHolder({
            label:options.label,
            filePath:options.filePath,
            fileType:'json-compact',
            dataType:'object',
            logErrorsFn:d$,
            preLoad:true,

            checkFn:(STree/*,args*/)=>{
                return (STree && STree.T && !STree.T.error());
            },

            getFn:(STree, $cfg, args)=>{
                if(!$cfg.checkFn(STree,args)) return;
                return STree;
            },

            printFn:(STree/*, $cfg, args*/)=>{
                STree.T.print({
                    skip_files:true,
                    printFn:clUI.print
                });
            },

            setFn:($cfg/*,args*/)=>{
                let STree = __new_SamplesTree();
                STree.T.read();
                if(!$cfg.checkFn(STree)) return;
                return STree;
            },

            loadFn:(fileData, $cfg/*,args*/)=>{
                if(!_.isObject(fileData)){
                    ConfigMgr.setFlag('samples_index_scan_needed',true);
                    return;
                }
                let STree = __new_SamplesTree();
                STree.T.fromJson(fileData);
                if(!$cfg.checkFn(STree)) return;
                return STree;
            },

            saveFn:(STree, $cfg/*,args*/)=>{
                if(!$cfg.checkFn(STree)) return;
                return STree.T.toJson();
            }
        });
    }


    hasLatestLookup(){
        return _.isObject(this._CACHE_latest_smp_obj_search);
    }

    getLatestLookup(){
        return this._CACHE_latest_smp_obj_search;
    }

    setLatestLookup(smp_obj){
        this._CACHE_latest_smp_obj_search = smp_obj;
    }


    /**
     * Check the main index file
     * @returns { boolean | null } true if exists, false if not exists, null if missing data
     */
    sampleIndexFileExistsSync(){
        return DataMgr.fileExistsSync(this._LABEL_samples_index);
    }


    printSamplesTree(){
        DataMgr.print(this._LABEL_samples_index)
    }


    hasSamplesIndex(){
        return DataMgr.hasData(this._LABEL_samples_index);
    }


    getSamplesIndex_DirectoryTree(){
        if(DataMgr.check(this._LABEL_samples_index)!==true) return null;
        return DataMgr.get(this._LABEL_samples_index).T;
    }

    setSamplesIndex(options){
        options = _.merge({
            //printFn:function(){},
            force:false
        },options);

        if(options.force === true){
            let smp_obj = DataMgr.set(this._LABEL_samples_index);
            if(!DataMgr.save(this._LABEL_samples_index)) return;
            return smp_obj;
        }
        return DataMgr.load(this._LABEL_samples_index);
    }


    searchSamplesByTags(tagString, random){
        this.setLatestLookup(null);

        let _self = this;
        let smp_obj_search = this._CACHE_stqall.get(tagString /* label */,function(){

            let ST = DataMgr.get(_self._LABEL_samples_index);
            if(!ST) return null;

            let smp_obj2 = ST.filterByTags(tagString);
            if(smp_obj2.error() || smp_obj2.size()==0) return null;

            return smp_obj2;
        });
        if(!smp_obj_search) return null;
        if(random!==true){
            this.setLatestLookup(smp_obj_search);
            return smp_obj_search;
        }

        this._CACHE_stqrnd.remove(tagString /* label */);
        let smp_obj_search_random = this._CACHE_stqrnd.get(tagString /* label */,function(){

            let smp_rnd_obj2 = smp_obj_search.getRandom(ConfigMgr.get('RandomCount'),ConfigMgr.get('MaxOccurrencesSameDirectory'));
            if(smp_rnd_obj2.error() || smp_rnd_obj2.size()==0) return null;

            return smp_rnd_obj2;
        });

        if(!smp_obj_search_random) return null;
        this.setLatestLookup(smp_obj_search_random);
        return smp_obj_search_random;
    }



    /**
     * Generate the directory with samples.
     * @param {Samples} smp_obj
     * @param options
     *        - dirname: custom name for the directory
     *        - overwrite: force overwrite otherwise rename
     * @returns object
     */
    generateSamplesDir_setOptions(smp_obj,options){
        options = _.merge({
            dirname:null,     //custom name
            overwrite:false,  //force overwrite
            path:null         //absolute path
        },options);

        // Set Path
        if(!_.isString(options.path)){
            if(!_.isString(options.dirname) || options.dirname.length<2) options.dirname=smp_obj.getTagShortLabel(); // DirName
            options.path = Utils.File.pathJoin(ProjectsMgr.current,ConfigMgr._labels.sample_dir, options.dirname);
        }

        // Set directory name
        if(options.overwrite!==true){
            options.path = Utils.File.checkAndSetDuplicatedDirectoryNameSync(options.path);
        }

        if(!options.path) return null;
        return options;
    }


    generateSamplesDir(smp_obj,options){
        // Create directory and files
        let p_array = [];
        let fname_array = [];
        let smp_copied_obj = smp_obj.createFromThis();
        let _links_dir = Utils.File.pathJoin(options.path,'_links');

        // Overwrite option
        if(options.overwrite===true){
            Utils.File.removeDirSync(options.path);
        }

        Utils.File.ensureDirSync(options.path);
        Utils.File.ensureDirSync(_links_dir);

        clUI.print("Copying "+smp_obj.size()+" samples...");

        //console.log('   generateSamplesDir - start copying '+smp_obj.size()+' files...');
        smp_obj.forEach(function(item,index){

            let f_name = _.noDuplicatedValues(fname_array,Utils.File.pathBasename(item.path),(v,cv,i,a)=>{
                if(_.indexOf(a,cv)<0) return true;
                return Utils.File.pathChangeFilename(v,(old_name)=>{
                    return old_name+'_'+i;
                });
            });
            fname_array.push(f_name);
            let link_file_name = f_name+'___'+Utils.replaceAll(item.path.substring(ConfigMgr.get('SamplesDirectory').length),Utils.File.pathSeparator,'___');

            /* Copy File */
            p_array.push(Utils.File.copyFile( item.path, Utils.File.pathJoin(options.path, f_name) ).then(function(data){
                smp_copied_obj.add(item);
                //console.log('   generateSamplesDir - sample file successfully copied '+data.path_to);
            }).catch(function(data){
                d$('generateSamplesDir - sample file copy failed '+data.path_to,data.err);
            }));

            /* Create txt link file */
            p_array.push(Utils.File.writeTextFile(Utils.File.pathJoin(_links_dir ,link_file_name), item.path /* text */).then(function(data){
                // do something
            }).catch(function(data){
                d$('generateSamplesDir - link file copy failed '+data.path_to,data.err);
            }));
        });

        return Promise.all(p_array)
            .then(function(data){
                //console.log('   generateSamplesDir - '+(smp_copied_obj.size())+'/'+(smp_obj.size())+' files copied.');
                return smp_copied_obj;
            })
            .catch(function(err){
                d$('generateSamplesDir - error on final step',err);
            });
    }




    /**
     * Check the coverage (or uncoverage) of all samples.
     * @param options
     *        - path: custom absolute path for the directory
     *        - query: custom query string with tags
     *        - createIndexes: true to generate the index files
     * @returns {Samples} smp_obj
     */
    checkSamplesCoverage(options){

        function __coverage_set_queries(){
            if(_.isString(options.query)){
                d$("> coverage: query from string");
                _data.tag_queries['default']=options.query;

            }else if(_.isString(options.tag)){
                d$("> coverage: query from string");
                _data.tag_queries[options.tag]=TQueryMgr.get(options.tag);

            }else if(!TQueryMgr.empty()) {
                d$("> coverage: query from tQuery");
                _data.tag_queries = TQueryMgr.getAsPlainObject();
            }
            d$("> coverage: tag_queries are",_data.tag_queries,"\n");
            _data.tags = Object.keys(_data.tag_queries);
            if(_data.tag_queries.length<=0) return false;
            return true;
        }

        function __coverage_set_path(){
            if(_.isString(options.path)){
                d$("> coverage: path from string; scanning the absolute path "+options.path+" ...");
            }else{
                options.path = null;
                d$("> coverage: path from config; reading the scan index...");
                d$("> coverage: setting progressive as 'true'..."); //because the samples directory could be too big!
            }
        }

        /* Internal data */
        let _data = {
            samples_count:0,
            tag_queries: {},
            tags:[],
            smpobj_by_tag:{},
            output:{
                enabled: true,
                max_length_tag_string:3
            }
        };

        /* Options */
        options = _.merge({
            path:null,
            query:null,

            lookingForCovered:false,
            progressive:false,

            stats:true,
            createIndexes:false
        },options);

        /* Console */
        clUI.print = (_.isNil(clUI.print)?function(){}:clUI.print);

        /* Tag Query */
        if(!__coverage_set_queries()){
            clUI.print("No tags or queries found.");
            return false;
        }

        /* Path */
        __coverage_set_path();

        /* Get SamplesTree */
        let ST = null;
        if(!options.path) ST=DataMgr.get(this._LABEL_samples_index);
        else{
            ST=new SamplesTree(options.directoryToScan,{/* SampleTree options */},this._directoryTreeOptionsFromConfig());
            ST.read();
        }
        if(!ST || ST.empty()){
            clUI.print("Cannot check the coverage: no samples found.");
            return false;
        }

        /* Set objects */
        _data.tags.forEach((v,i,a)=>{

            // Sample data and objects
            _data.smpobj_by_tag[v] = {
                obj:new Samples(ST.T.rootPath(), _data.tag_queries[v], {
                    //opposite_matching:options.lookingForCovered
                })
            };

            // Max length tag string
            if(v.length > _data.output.max_length_tag_string)
                _data.output.max_length_tag_string=v.length;
        });
        _data.smpobj_unmatched = {
            obj:new Samples(ST.T.rootPath())
        };

        /* Loop on each file */
        ST.T.forEach({
            itemCb:(data)=>{
                let smp_excluded = true
                _data.tags.forEach((v,i,a)=>{
                    if(_data.smpobj_by_tag[v].obj.add(data.item)===true){
                        //console.log(v,data.item.base);
                        smp_excluded = false;
                    }else{

                    }
                });
                if(smp_excluded===true) _data.smpobj_unmatched.obj.add(data.item);
            }
        });
        _data.samples_count = ST.size();

        let coverage_output = this._checkSamplesCoverageOutput1(_data, options);
        coverage_output.unmatched_obj = _data.smpobj_unmatched.obj;
        return coverage_output;
    }

    _checkSamplesCoverageOutput1(_data, options){
        let coverage_output = { error:true };

        if(!_data.output.enabled) return coverage_output;
        _data.smpobj_by_tag = Utils.sortObjectByKey(_data.smpobj_by_tag);

        let _max_len_size = (''+_data.samples_count+'').length+1;
        let _big_separator = _.repeat('-',120);

        let k_array = Object.keys(_data.smpobj_by_tag);
        coverage_output.array=[];
        k_array.forEach((v)=>{
            let cv_obj = {};
            coverage_output.array.push(cv_obj);

            if(!options.allinfo){
                cv_obj.output_line = (_.padEnd(/*"    Q#"+(i1+1)+" "*/v,_data.output.max_length_tag_string+3) +
                    ' coverage: '+_.padEnd(_data.smpobj_by_tag[v].obj.size(),_max_len_size /*replace*/) +
                    _.padEnd(' ('+_.round((_data.smpobj_by_tag[v].obj.size()/_data.samples_count*100),2)+'%)',11) +
                    ' q: '+_data.tag_queries[v]
                    //+'('+_.padEnd(_.round((_data.smpobj_by_tag[v].obj.size()/_data.samples_count*100),2)+'%',8)+')'
                );
            }else{
                cv_obj.output_line = ( v +
                    ' coverage: '+_data.smpobj_by_tag[v].obj.size() +
                    ' ('+_.round((_data.smpobj_by_tag[v].obj.size()/_data.samples_count*100),2)+'%)' +
                    ' q: '+_data.tag_queries[v]
                    //+'('+_.padEnd(_.round((_data.smpobj_by_tag[v].obj.size()/_data.samples_count*100),2)+'%',8)+')'
                );
                cv_obj.output_line += "\n"+_big_separator;
            }

            cv_obj.label = v;
            // cv_obj.label_print = cv_obj.label;
            // cv_obj.label_print_pad = _.padEnd(/*"    Q#"+(i1+1)+" "*/cv_obj.label,_data.output.max_length_tag_string+3);

            cv_obj.coverage_count = _data.smpobj_by_tag[v].obj.size();
            // cv_obj.coverage_count_print = _data.smpobj_by_tag[v].obj.size();
            // cv_obj.coverage_count_print_pad = _.padEnd(cv_obj.coverage_count_print,_max_len_size /*replace*/);

            cv_obj.coverage_perc = _.round((_data.smpobj_by_tag[v].obj.size()/_data.samples_count*100),2);
            // cv_obj.coverage_perc_print = '('+_.round((_data.smpobj_by_tag[v].obj.size()/_data.samples_count*100),2)+'%)';
            // cv_obj.coverage_perc_print_pad = _.padEnd(cv_obj.coverage_perc,11);

            cv_obj.query = _data.tag_queries[v];
            // cv_obj.query_print = cv_obj.query;
            // cv_obj.query_print_pad = cv_obj.query;

            cv_obj.smpobj = _data.smpobj_by_tag[v].obj; //.print
        });

        coverage_output.uncovered_output_line = "\nUncovered samples: "+
            _data.smpobj_unmatched.obj.size()+
            ' ('+_.round((_data.smpobj_unmatched.obj.size()/_data.samples_count*100),2)+'%)';
        coverage_output.uncovered_smpobj=_data.smpobj_unmatched.obj; //print/size
        //coverage_output.uncovered_perc=_.round((coverage_output.uncovered_smpobj.size()/_data.samples_count*100),2);
        //coverage_output.uncovered_perc_print='('+coverage_output.uncovered_perc+'%)';

        coverage_output.error = false;
        return coverage_output;
    }

}

module.exports = new SamplesManager();
