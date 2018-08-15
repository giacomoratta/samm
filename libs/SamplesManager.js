const Samples = require('./Samples.class.js');

class SamplesManager {

    constructor(){
    }


    /**
     * The first check on the sample path, according to rules configured in config.json.
     * @param path_string
     * @returns {boolean}
     * @private
     */
    _checkSampleName(path_string){
        let pp = path.parse(path_string);
        path_string = _.toLower(path_string);
        return ( _.indexOf( ConfigMgr.get('ExtensionExcludedForSamples') , ((pp.ext.length!=0?pp.ext:pp.name)) )<0 );
    }


    /**
     * Start scanning the whole samples directory (see Configuration).
     * @param {string} absPath
     * @param {boolean} force
     * @returns { Samples | null }
     */
    scanSamples(absPath, force, consoleOutput){
        let smp_obj = new Samples();
        let console_log = (consoleOutput!==false?console.log:function(){});

        if(!_.isString(absPath)){
            absPath=ConfigMgr.get('SamplesDirectory');
            if(this.sampleScanFileExists() && force!==true){
                smp_obj = this.loadSampleScanFromFile();
            }
        }
        if(!smp_obj) return;
        smp_obj.setOriginPath(absPath);
        if(!smp_obj.empty()) return smp_obj;

        if(!Utils.File.directoryExists(absPath)){
            console_log('   SamplesMgr.scan: directory does not exists! ('+absPath+')');
            return null;
        }

        this._scanSamples(smp_obj, absPath, {
            maxRec:1000000, //1.000.000
            callback:function(path_string){
                //console_log("  ",path_string);
                smp_obj.add(path_string);
            },
            callback_dir:function(path_string, found_samples, level){
                if(consoleOutput){
                    if(level>1) path_string=path.sep+path.parse(path_string).name;
                    console_log((level>1?+_.repeat(' ',3*level)+'|':'')+_.repeat('-',3*level), path_string,'('+found_samples+' samples)');
                }
            }
        });
        if(smp_obj.empty()) return null;
        return smp_obj;
    }


    /**
     * Performs a recursive scan.
     * @param {Samples} smp_obj - object to fill
     * @param {string} dir_path
     * @param {object} _options
     * @private
     */
    _scanSamples(smp_obj, dir_path, _options, _level){
        _options.maxRec--;
        if(_options.maxRec<=0){
            console.log('scanSamples: max recursions reached');
            return;
        }

        if(!_level) _level=1;
        let _sc_pre;

        let items = fs.readdirSync(dir_path);
        items = Utils.sortFilesArray(items);

        for (let i=0; i<items.length; i++) {
            //console.log(' >> ',items[i]);

            let path_string = path.join(dir_path,items[i]);
            let fsStat = fs.lstatSync(path_string);

            if(fsStat.isDirectory()){
                _sc_pre = smp_obj.size();
                this._scanSamples(smp_obj, path_string, _options, _level-1);
                _options.callback_dir(path_string,smp_obj.size()-_sc_pre,_level);

            }else if(fsStat.isFile() && this._checkSampleName(path_string)){
                // checkSampleName on path_string because we want to accept samples belonging directory with good name
                _options.callback(path_string);
            }
        }
    }


    /**
     * Check the main index file
     * @returns { boolean }
     */
    sampleScanFileExists(){
        let samples_index = path.resolve('./'+ConfigMgr._filename.samples_index);
        return Utils.File.fileExists(samples_index);
    }



    /**
     * Load the index file and store it in a Samples object.
     * @returns { Samples | null }
     */
    loadSampleScanFromFile(){
        let samples_index = path.resolve('./'+ConfigMgr._filename.samples_index);
        let json_string = '';
        try{
            json_string = fs.readFileSync(samples_index,'utf8');
        }catch(e){
            //console.log(e);
            return null;
        }
        let smp_obj = new Samples();
        if(!smp_obj.fromJsonString(json_string)) return null;
        return smp_obj;
    }


    /**
     * Create the index file for all samples.
     * @param {Samples} smp_obj
     * @param {bool} is_custom_index
     * @returns {boolean}
     */
    saveSampleScanToFile(smp_obj, is_custom_index){
        if(!smp_obj) return false;
        let abs_index_path=null;
        if(is_custom_index!==true){
            abs_index_path = path.join(Utils.abspath(),ConfigMgr._filename.samples_index);
        }else{
            abs_index_path = path.join(Utils.abspath(),ConfigMgr._filename.temp_dir,this._filename.custom_indexes,smp_obj.getTagLabel());
        }
        let samples_index = path.resolve(abs_index_path);
        let json_string = smp_obj.toJsonString();
        if(!json_string) return false;
        try{
            fs.writeFileSync(abs_index_path, json_string, 'utf8');
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }



    /**
     * Check and process the tag query string.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param {string} ts
     * @returns { object | null }
     */
    processTagString(ts, splitFn){
        let proc_obj = {
            _string:[],  //temporary array with strings e.g. ['a+b+c','d+e']
            string:"",  //final tag processed query
            array:[],   //array with subarrays of separated tags
            check_fn:null,  //function used to check the filename
            _check_fn_string:"" //temporary string with composed function which is evaluated
        };
        ts = _.toLower(ts).replace(/[^a-zA-Z0-9\s +,]/g,'');

        let _setSeparateAndFunctions = function(){};
        if(_.isArray(splitFn)){
            _setSeparateAndFunctions = function(string,tag_array,fn_body){
                if(Utils.searchInObjectArray(splitFn,'string',string)===true) return; //avoid duplicates
                splitFn.push({
                    string:string,
                    tag_array:tag_array,
                    check_fn:Utils.newFunction('f',fn_body)
                });
            };
        }

        /* Split tags and shuffle */
        let tagOR = _.split(ts,',');
        if(!_.isArray(tagOR) || tagOR.length<=0) return null;
        tagOR = _.shuffle(tagOR);

        /* Writing new function */
        tagOR.forEach(function(v1,i1,a1){
            v1=_.trim(v1);
            if(v1.length<=0) return;

            let _this_string, _this_fn_IF;
            let tagAND=_.split(v1,'+');
            proc_obj.array.push([]);
            let po_index = proc_obj.array.length-1;

            tagAND.forEach(function(v2,i2,a2){
                v2=_.trim(v2);
                if(v2.length<=0) return;
                a2[i2]=_.trim(a2[i2]);
                proc_obj.array[po_index].push(a2[i2]);
            });
            if(tagAND.length<=0) return;

            _this_fn_IF = "( f.indexOf('"+ _.join(tagAND,"')>=0 && f.indexOf('") +"')>=0 )";
            _this_string = _.join(tagAND,"+");

            proc_obj._check_fn_string+="if "+_this_fn_IF+" return true;\n";
            proc_obj._string.push(_this_string);

            _setSeparateAndFunctions(_this_string, tagAND, "return "+_this_fn_IF+"; ");
        });

        proc_obj.string = _.join(proc_obj._string,", ");
        proc_obj._check_fn_string+="return false;\n";

        /* Building new function */
        proc_obj.check_fn = Utils.newFunction('f',proc_obj._check_fn_string);
        if(!proc_obj.check_fn) return null;

        delete proc_obj._string;
        delete proc_obj._check_fn_string;
        return proc_obj;
    }



    /**
     * Perform a search by tags.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param tagString
     * @returns { Samples | null }
     */
    searchSamplesByTags(smp_obj_scan, tagString){
        let smp_obj = new Samples();
        let ptags_obj = this.processTagString(tagString);
        if(!ptags_obj) return null;

        let attempts = 5;
        let _MaxOccurrencesSameDirectory = ConfigMgr.get('MaxOccurrencesSameDirectory');
        let _RandomCount = ConfigMgr.get('RandomCount');
        let smp_obj_random = null;

        while(attempts>0){
            smp_obj.init();
            smp_obj_scan.forEach(function(item,index){
                if(ptags_obj.check_fn(item.n_path)){
                    //console.log("  ",ConfigMgr._sampleScan[i]);
                    smp_obj.addItem(item);
                }
            });
            if(smp_obj.empty()) return smp_obj;

            smp_obj_random = smp_obj.getRandom(_RandomCount, _MaxOccurrencesSameDirectory);
            if(smp_obj_random && smp_obj_random.size()>=_RandomCount) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;
        }
        if(!smp_obj_random || smp_obj_random.empty()) return smp_obj_random;
        smp_obj_random.setTags(ptags_obj.array);

        smp_obj_random.print('   ',function(n){ return n.substring(ConfigMgr.get('SamplesDirectory').length); });
        console.log("\n   Performed search: '"+ptags_obj.string+"'");
        console.log(  "   Random selection of "+_RandomCount+" samples","(max "+_MaxOccurrencesSameDirectory+" from the same directory)");
        //d(smp_obj_random);
        return smp_obj_random;
    }



    /**
     * Check if the current lookup is equal to the preious one.
     * @param {Samples} smp_obj
     * @returns {boolean}
     */
    isEqualToPreviousLookup(smp_obj){
        let old_smp_obj = this.openLookupFile();
        if(!old_smp_obj) return false;
        return old_smp_obj.isEqual(smp_obj);
    }



    /**
     * Save the latest lookup on file.
     * @param {Samples} smp_obj
     * @returns { Promise{string} | null }
     */
    saveLookupToFile(smp_obj){
        if(!smp_obj) return null;
        let lookup_file = path.resolve('./'+ConfigMgr._filename.latest_lookup);
        let text_to_file = smp_obj.toText();
        return Utils.File.writeTextFile(lookup_file,text_to_file);
    }



    /**
     * Open the file with latest lookup
     * @returns { {Samples} | null }
     */
    openLookupFile(){
        let lookup_file = path.resolve('./'+ConfigMgr._filename.latest_lookup);
        let file_to_text = "";
        try{
            file_to_text = fs.readFileSync(lookup_file, 'utf8');
        }catch(e){
            //console.log(e);
            return null;
        }
        let smp_obj = new Samples();
        if(!smp_obj.fromText(file_to_text)) return null;
        return smp_obj;
    }



    /**
     * Generate the directory with samples.
     * @param {Samples} smp_obj
     * @param options
     *        - dirname: custom name for the directory
     *        - forcedir: force overwrite otherwise rename
     * @returns { Promise{array} | null }
     */
    generateSamplesDir(smp_obj,options){
        let _path = path;
        if(!_.isObject(options)) options={
            dirname:null,   //custom name
            forcedir:false, //force overwrite
            _smppath:null    //absolute path (private)
        };

        if(!_.isString(options['dirname']) || options['dirname'].length<2) options['dirname']=_.join(_.slice(smp_obj.getTags(),0,2),'_');//.substring(0,20);
        options['_smppath'] = path.join(ConfigMgr.get('ProjectsDirectory'), ConfigMgr.get('Project'),ConfigMgr._labels.sample_dir, options['dirname']);
        if(options['forcedir']!==true){
            options['_smppath'] = Utils.File.checkAndSetDirectoryName(options['_smppath']);
        }
        if(!options['_smppath']) return null;
        if(smp_obj.empty()) return null;

        let p_array = [];
        let _links_dir = path.join(options['_smppath'],'_links');

        fs_extra.ensureDirSync(options['_smppath']);
        fs_extra.ensureDirSync(_links_dir);

        console.log('   generateSamplesDir - start copying '+smp_obj.size()+' files...');
        smp_obj.forEach(function(item,index){
            let f_name = path.basename(item.path);
            let link_file_name = f_name+'___'+Utils.replaceAll(item.path.substring(ConfigMgr.get('SamplesDirectory').length),_path.sep,'___');

            /* Copy File */
            p_array.push(Utils.File.copyFile( item.path, path.join(options['_smppath'] ,f_name) ).then(function(data){
                console.log('   generateSamplesDir - sample file successfully copied '+data.path_to);
            }).catch(function(data){
                console.log('   generateSamplesDir - sample file copy failed '+data.path_to);
                console.error(data.err);
            }));

            /* Create txt link file */
            p_array.push(Utils.File.writeTextFile(path.join(_links_dir ,link_file_name), item.path /* text */).catch(function(data){
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

        let _self = this;
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
            let ptag_obj = _self.processTagString(_tagQueries[v],_ptags);
        });
        _ptags.forEach(function(v){
            if(v.string.length> options._output.max_length_tag_string)
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

        let smp_obj = this.scanSamples(options.dirPath);
        if(smp_obj.empty()){
            _d("Cannot check the coverage: no samples found. \n");
            return null;
        }

        if(options.stats) {
            options.progressive = options.progressive_keepalive = false;
        }

        return this._checkSamplesCoverage(smp_obj, options, _ptags, _d);
    }

    _checkSamplesCoverage(smp_obj, options, _ptags, _d){
        _d("checking the coverage of "+smp_obj.size()+" samples...");

        // _ptags = array of {string,check_fn} objects
        _.sortBy(_ptags, [function(o) { return o.string; }]);
        options.dirPath = smp_obj.getOriginPath();
        //options.dirPath = path.resolve(smp_obj.getOriginPath());

        let coverage_array = [];
        let uncovered_items = [];

        _ptags.forEach(function(v1,i1,a1){

            let smp_coverage = new Samples();
            smp_coverage.setTags(v1.tag_array);
            coverage_array.push({
                covered:0,
                uncovered:0,
                query:v1.string,
                samples:smp_coverage
            });

            let coverage_item = coverage_array[coverage_array.length-1];

            smp_obj.forEach(function(item,i2){
                let is_covered = v1.check_fn(item.n_path);
                if(is_covered===options.lookingForCoverage){
                    smp_coverage.addItem(item);
                }
                if(is_covered){
                    coverage_item.covered++;
                }
                else{
                    coverage_item.uncovered++;
                    if(uncovered_items.indexOf(item.path)<0) uncovered_items.push(item.path);
                }
            });

            if(options.consoleOutput){
                if(!options.stats && (options.progressive || options.progressive_keepalive)){
                    options.console_log("\n");
                    smp_coverage.forEach(function(item,index){ options.console_log("    "+(item.path.substring(options.dirPath.length))); });
                    options.console_log("  "+_.repeat('-', 100));
                }

                options.console_log(_.padEnd("    Q#"+(i1+1)+" "+v1.string,options._output.max_length_tag_string+12)+
                                    ' [ c:'+_.padEnd(coverage_item.covered+',',12)+
                                    ' u:'+_.padEnd(coverage_item.uncovered+',',12)+
                                    ' coverage:'+_.padEnd(Math.round((coverage_item.covered/(coverage_item.covered+coverage_item.uncovered)*100))+'%',6)+']');
            }

            if(!options.dirPathCustom && options.createIndexes===true && coverage_item.uncovered<=0){
                //reading from config.samplesdir
                this.saveSampleScanToFile(smp_coverage,true /*is_custom_index*/);
            }

            if(options.progressive &&
                ((options.lookingForCoverage && coverage_item.covered>0)
                    || (!options.lookingForCoverage && coverage_item.uncovered>0))
            ){
                Utils.EXIT();
            }

            if(options.progressive_keepalive &&
                ((options.lookingForCoverage && coverage_item.covered>0)
                    || (!options.lookingForCoverage && coverage_item.uncovered>0))
            ){
                    readlinesync.question();
            }
        });

        if(options.stats){
            uncovered_items.sort();
            options.console_log("  Uncovered samples:");
            uncovered_items.forEach(function(v){
                options.console_log("    "+v);
            });
        }

        return coverage_array;
    }
};

module.exports = new SamplesManager();
