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
        path_string = _.toLower(path_string);
        if(_.indexOf(ConfigMgr.get('ExtensionExcludedForSamples'),path.extname(' '+path_string))>=0){ //space needed to read 'only-ext' files
            return false;
        }
        return true;
    }


    /**
     * Start scanning the whole samples directory (see Configuration).
     * @param {string} absPath
     * @param {boolean} force
     * @returns { Samples | null }
     */
    scanSamples(absPath, force, consoleOutput){
        let smp_obj = new Samples();
        let console_log = (consoleOutput===true?console.log:function(){});

        if(!_.isString(absPath)){
            absPath=ConfigMgr.get('SamplesDirectory');
            if(this.sampleScanFileExists() && force!==true){
                return this.loadSampleScanFromFile();
            }
        }

        if(!Utils.File.directoryExists(absPath)){
            console_log('   SamplesMgr.scan: directory does not exists! ('+absPath+')');
            return null;
        }

        this._scanSamples(smp_obj, absPath, {
            maxRec:1000000, //1.000.000
            callback:function(path_string){
                console_log("  ",path_string);
                smp_obj.array.push(path_string);
                smp_obj.array_normalized.push(_.toLower(path_string));
            }
        });
        if(smp_obj.array.length<=0) return null;
        return smp_obj;
    }


    /**
     * Performs a recursive scan.
     * @param {Samples} smp_obj - object to fill
     * @param {string} dir_path
     * @param {object} _options
     * @private
     */
    _scanSamples(smp_obj, dir_path, _options){
        if(_options.maxRec<=0){
            console.log('scanSamples: max recursions reached');
            return;
        }

        let items = fs.readdirSync(dir_path);
        items = Utils.sortFilesArray(items);

        for (let i=0; i<items.length; i++) {
            //console.log(' >> ',items[i]);

            let path_string = path.join(dir_path,items[i]);
            let fsStat = fs.lstatSync(path_string);

            if(fsStat.isDirectory()){
                this._scanSamples(smp_obj, path_string, _options);

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
     * @returns {boolean}
     */
    saveSampleScanToFile(smp_obj){
        if(!smp_obj) return false;
        let samples_index = path.resolve('./'+ConfigMgr._filename.samples_index);
        let json_string = smp_obj.toJsonString();
        if(!json_string) return false;
        try{
            fs.writeFileSync(samples_index, json_string, 'utf8');
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
            _setSeparateAndFunctions = function(string,fn_body){
                splitFn.push({
                    string:string,
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

            _setSeparateAndFunctions(_this_string, "return "+_this_fn_IF+"; ");
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

        console.log(" Looking for: '"+ptags_obj.string+"'");

        let attempts = 5;
        let _MaxOccurrencesSameDirectory = ConfigMgr.get('MaxOccurrencesSameDirectory');
        let _RandomCount = ConfigMgr.get('RandomCount');

        while(attempts>0){
            smp_obj.init();
            smp_obj.tags = ptags_obj.array;

            for(let i=0; i<smp_obj_scan.array.length; i++) {
                if(ptags_obj.check_fn(smp_obj_scan.array_normalized[i])){
                    //console.log("  ",ConfigMgr._sampleScan[i]);
                    smp_obj.add(smp_obj_scan.get(i));
                }
            }
            if(smp_obj.array.length<=0) return smp_obj;

            smp_obj.setRandom(_RandomCount, _MaxOccurrencesSameDirectory);
            if(smp_obj.random.length==_RandomCount) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;
        }
        if(smp_obj.random.length<=0) return smp_obj;

        Utils.printArrayOrderedList(smp_obj.random,'   ',function(n){ return n.substring(ConfigMgr.get('SamplesDirectory').length); });
        console.log("\n   Performed search: '"+ptags_obj.string+"'");
        console.log(  "   Random selection of "+_RandomCount+" samples","(max "+_MaxOccurrencesSameDirectory+" from the same directory)");
        return smp_obj;
    }



    /**
     * Check if the current lookup is equal to the preious one.
     * @param {Samples} smp_obj
     * @returns {boolean}
     */
    isEqualToPreviousLookup(smp_obj){
        let old_smp_obj = this.openLookupFile();
        if(!old_smp_obj) return false;
        if(smp_obj.random.length!=old_smp_obj.random.length) return false;
        let eq=true;
        for(let i=0; i<smp_obj.random.length; i++){
            if(smp_obj.random[i]!=old_smp_obj.random[i]){
                eq=false;
                break;
            }
        }
        return eq;
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
        return new Promise(function(res,rej){
            fs.writeFile(lookup_file, text_to_file, 'utf8',function(err){
                if(err){ rej(err); return; }
                res(lookup_file);
            });
        });
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
        smp_obj.random = smp_obj.array;
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

        if(!_.isString(options['dirname']) || options['dirname'].length<2) options['dirname']=_.join(_.slice(smp_obj.tags,0,2),'_');//.substring(0,20);
        options['_smppath'] = path.join(ConfigMgr.get('ProjectsDirectory'), ConfigMgr.get('Project'),ConfigMgr._labels.sample_dir, options['dirname']);
        if(options['forcedir']!==true){
            options['_smppath'] = Utils.File.checkAndSetDirectoryName(options['_smppath']);
        }
        if(!options['_smppath']) return null;

        let smpl_arr = smp_obj.random;
        if(!smpl_arr || smpl_arr.length<=0) smpl_arr = smp_obj.array;
        if(!smpl_arr || smpl_arr.length<=0) return null;

        let p_array = [];
        let _links_dir = path.join(options['_smppath'],'_links');

        fs_extra.ensureDirSync(options['_smppath']);
        fs_extra.ensureDirSync(_links_dir);

        console.log('   generateSamplesDir - start copying '+smpl_arr.length+' files...');
        smpl_arr.forEach(function(v,i,a){
            let f_name = path.basename(v);
            let link_file_name = f_name+'___'+Utils.replaceAll(v.substring(ConfigMgr.get('SamplesDirectory').length),_path.sep,'___');

            /* Copy File */
            p_array.push(Utils.File.copyFile( v, path.join(options['_smppath'] ,f_name) ).then(function(data){
                console.log('   generateSamplesDir - sample file successfully copied '+data.path_to);
            }).catch(function(data){
                console.log('   generateSamplesDir - sample file copy failed '+data.path_to);
                console.error(data.err);
            }));

            /* Create txt link file */
            p_array.push(Utils.File.writeTextFile(path.join(_links_dir ,link_file_name), v /* text */).catch(function(data){
                console.log('   generateSamplesDir - link file copy failed '+data.path_to);
                console.error(data.err);
            }));
        });

        return Promise.all(p_array)
            .then(function(data){
                console.log('   generateSamplesDir - '+p_array.length+' files successfully copied!');
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
     * @returns {Samples} smp_obj
     */
    checkSamplesCoverage(options){
        options = _.merge({
            dirPath:null,
            tagQuery:null,
            getUncovered:true,
            consoleOutput:true
        },options);

        let _d = function(m){ arguments[0]='coverage: '+arguments[0]; console.log.apply(null,arguments); };

        let _self = this;
        options.console_log = (options.consoleOutput===true?console.log:function(){});

        /* Check getUncovered */
        if(!_.isBoolean(options.getUncovered)) options.getUncovered=true;
        _d("uncovered ",options.getUncovered,"\n");

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
            _self.processTagString(_tagQueries[v],_ptags);
        });
        _d("Processed tags are",_ptags,"\n");
        if(_ptags.length<=0) return null;

        /* Check dirPath */
        if(_.isString(options.dirPath)){
            _d("dirPath from string; scanning the absolute path "+options.dirPath+" ...");
        }else{
            options.dirPath = null;
            _d("dirPath from config; reading the scan index...");
        }
        let smp_obj = this.scanSamples(options.dirPath);
        _d("Found "+smp_obj.array.length+" samples \n");
        if(smp_obj.array.length<=0) return null;

        return this._checkSamplesCoverage(smp_obj, options, _ptags, _d);
    }

    _checkSamplesCoverage(smp_obj, options, _ptags, _d){
        // _ptags = array of {string,check_fn} objects
        _.sortBy(_ptags, [function(o) { return o.string; }]);
        options.dirPath = path.resolve(options.dirPath);
        let smp_coverage = new Samples();

        _ptags.forEach(function(v1,i1,a1){
            options.console_log("\n    Q#"+(i1+1)+" "+v1.string);
            options.console_log("  "+_.repeat('-', 100));

            smp_obj.array_normalized.forEach(function(v2,i2,a2){
                if(v1.check_fn(v2)!==options.getUncovered){
                    options.console_log("    "+(smp_obj.get(i2).substring(options.dirPath.length+1)));
                    smp_coverage.add(smp_obj.get(i2));
                }
            });
        });
        return smp_coverage;
    }
};

module.exports = new SamplesManager();
