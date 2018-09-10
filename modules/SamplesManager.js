class SamplesManager {

    constructor(){
        this._cache = new DataCache();

        this._samples_index_label = 'samples_index';

        this._createIndexHolder({
                label: this._samples_index_label,
                filePath: ConfigMgr.path('samples_index'),
                directoryToScan: ConfigMgr.path('samples_directory')
        });
    }

    _createIndexHolder(options){
        let __new_SamplesTree = function(){
            let STree = new SamplesTree(options.directoryToScan,{
                /* SampleTree options */
            },{
                /* DirectoryTree options */
                excludedExtensions:ConfigMgr.get('ExtensionExcludedForSamples')
            });
            return STree;
        }

        return DataMgr.setHolder({
            label:options.label,
            filePath:options.filePath,
            fileType:'json',
            dataType:'object',
            logErrorsFn:console.log,
            preLoad:true,

            checkFn:(STree,args)=>{
                return (STree && STree.T && !STree.T.error());
            },

            getFn:(STree, $cfg, args)=>{
                if(!$cfg.checkFn(STree,args)) return;
                return STree;
            },

            printFn:(STree, $cfg, args)=>{
                STree.T.print();
            },

            setFn:($cfg,args)=>{
                let STree = __new_SamplesTree();
                STree.T.read();
                if(!$cfg.checkFn(STree)) return;
                return STree;
            },

            loadFn:(fileData, $cfg, args)=>{
                if(!_.isObject(fileData)) return;
                let STree = __new_SamplesTree();
                STree.T.fromJson(fileData);
                if(!$cfg.checkFn(STree)) return;
                return STree;
            },

            saveFn:(STree, $cfg, args)=>{
                if(!$cfg.checkFn(STree)) return;
                return STree.T.toJson();
            }
        });
    }


    /**
     * Check the main index file
     * @returns { boolean | null } true if exists, false if not exists, null if missing data
     */
    sampleIndexFileExistsSync(){
        return DataMgr.fileExistsSync(this._samples_index_label);
    }


    printSamplesTree(){
        DataMgr.print(this._samples_index_label)
    }


    hasSamplesIndex(){
        return DataMgr.hasData(this._samples_index_label);
    }


    setSamplesIndex(options){
        options = _.merge({
            //printFn:function(){},
            force:false
        },options);

        if(options.force === true){
            let smp_obj = DataMgr.set(this._samples_index_label);
            if(!DataMgr.save(this._samples_index_label)) return;
            return smp_obj;
        }
        return DataMgr.load(this._samples_index_label);
    }


    searchSamplesByTags(tagString, random){
        let smp_obj_search = this._cache.get('searchtagquery_'+tagString /* label */,function(){

            let ST = DataMgr.get(this._samples_index_label);
            if(!ST) return null;

            let smp_obj2 = ST.filterByTags(tagString);
            if(smp_obj2.error() || smp_obj2.size()==0) return null;

            return smp_obj2;
        });
        if(!smp_obj_search) return null;
        if(random!==true) return smp_obj_search;


        this._cache.remove('randomsearchtagquery_'+tagString /* label */);
        let smp_obj_search_random = this._cache.get('randomsearchtagquery_'+tagString /* label */,function(){

            let smp_rnd_obj2 = smp_obj_search.getRandom(10,2);
            if(smp_rnd_obj2.error() || smp_rnd_obj2.size()==0) return null;

            return smp_rnd_obj2;
        });

        if(!smp_obj_search_random) return null;
        return smp_obj_search_random;
    }







    /* ... work in progress ...*/

    /**
     * Generate the directory with samples.
     * @param {Samples} smp_obj
     * @param options
     *        - dirname: custom name for the directory
     *        - forcedir: force overwrite otherwise rename
     * @returns { Promise{array} | null }
     */
    generateSamplesDir(smp_obj,options){
        if(!_.isObject(options)) options={
            dirname:null,   //custom name
            forcedir:false, //force overwrite
            _smppath:null    //absolute path (private)
        };

        if(!_.isString(options['dirname']) || options['dirname'].length<2) options['dirname']=smp_obj.getTagShortLabel();
        options['_smppath'] = Utils.File.pathJoin(ConfigMgr.get('Project'),ConfigMgr._labels.sample_dir, options['dirname']);
        if(options['forcedir']!==true){
            options['_smppath'] = Utils.File.checkAndSetDuplicatedDirectoryNameSync(options['_smppath']);
        }
        if(!options['_smppath']) return null;
        if(smp_obj.empty()) return null;

        let p_array = [];
        let _links_dir = Utils.File.pathJoin(options['_smppath'],'_links');

        Utils.File.ensureDirSync(options['_smppath']);
        Utils.File.ensureDirSync(_links_dir);

        console.log('   generateSamplesDir - start copying '+smp_obj.size()+' files...');
        smp_obj.forEach(function(item,index){
            let f_name = Utils.File.pathBasename(item.path);
            let link_file_name = f_name+'___'+Utils.replaceAll(item.path.substring(ConfigMgr.get('SamplesDirectory').length),Utils.File.pathSeparator,'___');

            /* Copy File */
            p_array.push(Utils.File.copyFile( item.path, Utils.File.pathJoin(options['_smppath'] ,f_name) ).then(function(data){
                console.log('   generateSamplesDir - sample file successfully copied '+data.path_to);
            }).catch(function(data){
                console.log('   generateSamplesDir - sample file copy failed '+data.path_to);
                console.error(data.err);
            }));

            /* Create txt link file */
            p_array.push(Utils.File.writeTextFile(Utils.File.pathJoin(_links_dir ,link_file_name), item.path /* text */).catch(function(data){
                console.log('   generateSamplesDir - link file copy failed '+data.path_to);
                console.error(data.err);
            }));
        });

        return Promise.all(p_array)
            .then(function(data){
                console.log('   generateSamplesDir - '+(p_array.length/2)+' files successfully copied!');
                return data;
            })
            .catch(function(err){
                console.log('   generateSamplesDir - error on final step');
                console.error(err);
            });
    }



    /**
     * Check the coverage (or uncoverage) of all samples.
     * @param options
     *        - dirPath: custom absolute path for the directory
     *        - tagQuery: custom query string with tags
     *        - getUncovered: true to collect uncovered samples
     *        - consoleOutput: true to print result directly in the console
     *        - createIndexes: true to generate the index files
     * @returns {Samples} smp_obj
     */
    checkSamplesCoverage(options){
        options = _.merge({
            stats:true,
            dirPath:null,
            dirPathCustom:false,
            tagQuery:null,
            coverageCondition:true,
            consoleOutput:true,
            createIndexes:false,
            _output:{
                max_length_tag_string:10
            }
        },options);

        let _d = function(m){ arguments[0]='coverage: '+arguments[0]; console.log.apply(null,arguments); };

        options.console_log = (options.consoleOutput===true?console.log:function(){});

        /* Check getUncovered */
        if(!_.isBoolean(options.coverageCondition)) options.coverageCondition=true;
        _d("uncovered ",options.coverageCondition,"\n");

        /* Check tagQuery */
        let _tagQueries = {};
        if(_.isString(options.tagQuery)){
            _d("tagQuery from string");
            _tagQueries['default']=options.tagQuery;
        }else if(_.isObject(ConfigMgr.get('Tags'))) {
            _d("tagQuery from config.Tags");
            _tagQueries = ConfigMgr.get('Tags');
        }
        _d("tagQueries are",_tagQueries,"\n");
        if(_tagQueries.length<=0) return null;

        /* Process all tag queries */
        let _ptags = [];
        Object.keys(_tagQueries).forEach(function(v,i,a){
            let ptag_obj = Samples.processTagString(_tagQueries[v],_ptags);
        });
        _ptags.forEach(function(v){
            if(v.string.length > options._output.max_length_tag_string)
                options._output.max_length_tag_string=v.string.length;
        });
        _d("found ",_ptags.length," tag 'AND conditions'\n");
        //_d("processed tag 'AND conditions' are",_ptags,"\n");
        //_d("processed tag 'AND conditions' are"); _ptags.forEach(function(v){ console.log("\t"+v.string); });
        if(_ptags.length<=0) return null;

        /* Check dirPath */
        if(_.isString(options.dirPath)){
            _d("dirPath from string; scanning the absolute path "+options.dirPath+" ...");
        }else{
            options.dirPath = null;
            _d("dirPath from config; reading the scan index...");
            options.progressive = true;
            _d("setting progressive as 'true'...");
        }

        let ST = DataMgr.get(this._samples_index_label);
        if(ST.empty()){
            _d("Cannot check the coverage: no samples found. \n");
            return null;
        }

        /* Option fixes */
        if(options.stats) {
            options.progressive = options.progressive_keepalive = false;
        }

        return this._checkSamplesCoverage(ST, options, _ptags, _d);
    }

    _checkSamplesCoverage(ST, options, _ptags, _d){
        _d("checking the coverage of "+ST.size()+" samples...");

        // _ptags = array of {string,check_fn} objects
        _.sortBy(_ptags, [function(o) { return o.string; }]);
        options.dirPath = ST.getOriginPath();

        let coverage_array = [];
        let __uncovered_items = {};

        _ptags.forEach(function(v1,i1,a1){

            let smp_coverage = new SamplesTree();
            smp_coverage.setTags(v1.tag_array);
            coverage_array.push({
                covered:0,
                uncovered:0,
                query:v1.string,
                samples:smp_coverage
            });

            let coverage_item = coverage_array[coverage_array.length-1];

            ST.T.forEach({
                itemCb:function(data){
                    if(!__uncovered_items[data.item.n_path]) __uncovered_items[data.item.n_path]={ path:data.item.path, check:true };

                    let is_covered = v1.check_fn(data.item.n_path);
                    if(is_covered===options.lookingForCoverage){
                        smp_coverage.addItem(data.item);
                    }
                    if(is_covered){
                        coverage_item.covered++;
                        __uncovered_items[data.item.n_path].check = false;
                    }
                    else{
                        coverage_item.uncovered++;
                        //if(uncovered_items.indexOf(item.path)<0) uncovered_items.push(item.path);
                    }
                }
            });

            if(options.consoleOutput){
                if((options.progressive || options.progressive_keepalive)){
                    options.console_log("\n");
                    smp_coverage.forEach(function(item,index){ options.console_log("    "+(item.path.substring(options.dirPath.length))); });
                    options.console_log("  "+_.repeat('-', 100));
                }

                options.console_log(_.padEnd(/*"    Q#"+(i1+1)+" "*/"     "+v1.string,options._output.max_length_tag_string+9)+
                                    ' c:'+_.padEnd(coverage_item.covered,10)+
                                    ' u:'+_.padEnd(coverage_item.uncovered,10)+
                                    ' coverage:'+_.padEnd(Math.round((coverage_item.covered/(coverage_item.covered+coverage_item.uncovered)*100))+'%',5));
            }

            /* Save Custom INDEX */
            if(!options.dirPathCustom && options.createIndexes===true && coverage_item.uncovered<=0){
                //reading from config.samplesdir
                this.saveSampleScanToFile(smp_coverage,true /*is_custom_index*/);
            }

            /* Progressive */
            if(options.progressive &&
                ((options.lookingForCoverage && coverage_item.covered>0)
                    || (!options.lookingForCoverage && coverage_item.uncovered>0))
            ){
                Utils.EXIT();
            }

            /* Progressive and Keep-Alive */
            if(options.progressive_keepalive &&
                ((options.lookingForCoverage && coverage_item.covered>0)
                    || (!options.lookingForCoverage && coverage_item.uncovered>0))
            ){
                CliMgr.waitForEnter();
            }
        });
        options.console_log("");

        if(options.stats){
            //uncovered_items.sort();
            let __uncovered_items_count = 0;
            Object.keys(__uncovered_items).forEach(function(v){
                if(__uncovered_items[v].check===false) return;
                options.console_log("    "+__uncovered_items[v].path);
                __uncovered_items_count++;
            });
            if(__uncovered_items_count>0) options.console_log("  Found "+__uncovered_items_count+" uncovered samples.");
            else options.console_log("  All samples are covered!");
        }

        return coverage_array;
    }
};

module.exports = new SamplesManager();
