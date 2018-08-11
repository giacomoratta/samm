class ConfigManager {

    constructor(){
        this._sampleScan = null;
        this._filename = {
            config: 'config.json',
            config_sample: 'config.sample.json',
            temp_dir: 'temp/',
            latest_lookup: 'temp/latest_lookup',
            samples_index: 'temp/samples_index'
        };
        this._labels = {
            'sample_dir':'mpl'
        };
        this._cli_options = {
            tag_label:'-t',
            directory_name:'-n',
            directory_path:'-d',
            tag_query:'-q',
            selection:'-s',
            force:'-f'
        };

        // Open config.json
        this._config = this._openConfigJson();
        if(!this._config){
            Utils.EXIT('Cannot create or read the configuration file '+this._filename.config);
        }

        // Create temp directory
        fs_extra.ensureDirSync(Utils.abspath()+this._filename.temp_dir);
    }

    _openConfigJson(){
        let _config = null;
        try{
            _config = require('../'+this._filename.config);
            return _config;
        }catch(e){
            Utils.File.copyFileSync(Utils.abspath()+this._filename.config_sample,Utils.mainPath()+this._filename.config,{overwrite:false});
        }
        try{
            _config = require('../'+this._filename.config);
        }catch(e){
            return null;
        }
        return _config;
    }

    printHelp(){
        let i=1;
        console.log("\n----------------------------------------------------------------------------------------------------");
        console.log("  HELP");
        console.log("----------------------------------------------------------------------------------------------------");
        console.log("\n  set: modifies a configuration parameter.");
        console.log("       [e.g.#"+(i++)+"]  set Project project-name  / (or path)");
        console.log("       [e.g.#"+(i++)+"]  set Tag tag-label query,tag+tag2,or,tag3 ");
        console.log("       [e.g.#"+(i++)+"]  set ExtensionExcludedForSamples ext  / (or .ext)");
        console.log("       [e.g.#"+(i++)+"]  set ExtensionExcludedForSamples !ext  / (or !.ext)");

        console.log("\n  config: shows the current configuration parameters.");

        console.log("\n  scan: starts a full scan of the sample directory config.ProjectsDirectory.");
        console.log("       in order to avoid resource wasting, if the index is already present the scan does not start;");
        console.log("       use the option "+this._cli_options.force+" to force the rescan.");

        console.log("\n  lookup: looks for the tags and selects random samples;");
        console.log("       the tag query is an AND/OR query (','=or, '+'=and).");
        console.log("       [e.g.#"+(i++)+"]  lookup query,tag+tag2,or,tag3");
        console.log("       [e.g.#"+(i++)+"]  lookup "+this._cli_options.tag_label+"=tag_label  / select query from config.Tags[tag_label]");

        console.log("\n  coverage: check the coverage of samples in according to the tags present in config.Tags;");
        console.log("       it collects some stats and print them at the end.");
        console.log("       [e.g.#"+(i++)+"]  coverage -d=\"C:\\abs\\path\\\"  / coverage on external path (e.g. new samples)");

        console.log("\n  save: create a directory with the samples previously found;");
        console.log("       the directory name is set automatically with some tag names;");
        console.log("       [e.g.#"+(i++)+"]  save "+this._cli_options.directory_name+"=dir-name  / save in a custom directory");

        console.log("\n----------------------------------------------------------------------------------------------------");
    }

    checkProperty(name){
        return !_.isUndefined(this._config[name]);
    }

    get(name){
        return this._config[name];
    }

    _set(old_v,new_v){
        let _outcome_error = { error:true, type:null, value:null };
        let _outcome_value = { error:false, type:null, value:new_v };

        if(_.isArray(old_v)){
            _outcome_value.type = _outcome_error.type = 'array';
            if(!_.isArray(new_v) && !_.isString(new_v)) { // no conversion
                return _outcome_error;
            }
            _outcome_value.value = new_v;
            return _outcome_value;
        }

        if(_.isObject(old_v)){
            _outcome_value.type = _outcome_error.type = 'object';
            if(!_.isObject(new_v)) {
                // no conversion
                return _outcome_error;
            }
            _outcome_value.value = new_v;
            return _outcome_value;
        }

        // if(_.isInteger(old_v)){
        //     _outcome_value.type = _outcome_error.type = 'integer';
        //     if(!_.isInteger(new_v)) {
        //         if(!_.isString(new_v)) return _outcome_error;
        //         new_v = Utils.strToInteger(new_v);
        //         if(_.isNil(new_v)) return _outcome_error;
        //     }
        //     _outcome_value.value = new_v;
        //     return _outcome_value;
        // }

        if(_.isNumber(old_v)){
            _outcome_value.type = _outcome_error.type = 'number';
            if(!_.isNumber(new_v)) {
                if(!_.isString(new_v)) return _outcome_error;
                new_v = Utils.strToFloat(new_v);
                if(_.isNil(new_v)) return _outcome_error;
            }
            _outcome_value.value = new_v;
            return _outcome_value;
        }

        if(_.isString(old_v)){
            _outcome_value.type = _outcome_error.type = 'string';
            new_v = Utils.strToString(new_v);
            if(_.isNil(new_v)) return _outcome_error;
            _outcome_value.value = _.trim(new_v);
            return _outcome_value;
        }

        return _outcome_error;
    }

    set(name, value){
        let _outcome = this._set(this._config[name],value);
        d(_outcome);
        if(_outcome.error==true){
            if(_outcome.type){
                console.log("   Config.set: current value and old value have different types.\n");
                console.log("               old: ",this._config[name]);
                console.log("               new: ",value);
            }
            return null;
        }
        return this._setFinalValue(name,_outcome);
    }


    _setFinalValue(n,_outcome){
        let v = _outcome.value;

        if(n=="Project"){
            let ph = path.parse(v);
            v = ph.base || ph.name;
            let proj_dir = this._config['ProjectsDirectory'];
            if(_.isString(ph.dir) && ph.dir.length>0) proj_dir=ph.dir+path.sep;
            if(!Utils.File.directoryExists(proj_dir+v)){
                console.log("   The project directory does not exist: "+proj_dir+v);
                return;
            }
            this._config['ProjectsDirectory'] = ph.dir+path.sep;
        }

        if(_outcome.type=='array' && this._config[n].length>0){
            let _ot = this._set(this._config[n][0],v);
            if(_ot.error==true){
                if(_ot.type){
                    console.log("   Config.set [Array]: current value and old value have different types.");
                    console.log("\n                       old: ",this._config[n][0]);
                    console.log("\n                       new: ",v);
                }
                return null;
            }

            if(n=="ExtensionExcludedForSamples"){
                if(v[0]=='!'){
                    v=v.slice(1);
                    _.remove(this._config[n],function(value){ return (value==v || value=='.'+v ); });
                    return v;
                }
                if(v[0]!='.') v='.'+v;
            }
            if(this._config[n].indexOf(v)<0) this._config[n].push(v);
            return this._config[n];
        }
        this._config[n] = v;
        return v;
    }

    save(){
        let file_path = path.resolve(this._filename.config);
        let config_text = JSON.stringify(this._config, null, '\t');
        try{
            fs.writeFileSync(file_path, config_text, 'utf8');
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }

    print(){
        console.log("\n  Configuration");
        let keys = _.keys(this._config);
        let _this=this;
        keys.forEach(function(v){
            let vprint = '';
            if(_.isArray(_this._config[v])) vprint=JSON.stringify(_this._config[v], null, '');
            else if(_.isObject(_this._config[v])){
                vprint=JSON.stringify(_this._config[v], null, '  ');
                if(vprint.length>3) vprint = "\n\t  "+Utils.replaceAll(vprint,"\n","\n\t  ");
            }
            else vprint=JSON.stringify(_this._config[v], null, '');
            console.log("    "+v+':'+" "+vprint);
        });
    }


    setFromCliParams(name,values){
        /* Custom action 'set' */
        if(name=='Tags') return this.setTags(values);
        return this.set(name,values[0]);
    }

    setTags(values){
        if(!_.isObject(this._config['Tags'])) this._config['Tags']={};
        if(values.length==1){
            if(!this._config['Tags'][values[0]]) return null;
            delete this._config['Tags'][values[0]];
        } else if(_.isString(values[1])) {
            this._config['Tags'][values[0]] = values[1];
        }
        return true;
    }
};

module.exports = new ConfigManager();
