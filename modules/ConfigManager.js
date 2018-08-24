class ConfigManager {

    constructor(options){
       options = this._parseExternalOptions(options);
        this._paths = {
            config_file: options.config_file,
            config_file_sample: options.config_file_sample,
            temp_dir: options.temp_dir,
            custom_indexes: options.custom_indexes,
            latest_lookup: options.latest_lookup,
            samples_index: options.samples_index,
        };
        this._labels = {
            'sample_dir':'mpl'
        };
        let _self=this;

        // Check and set paths
        this._paths.config_file = Utils.File.setAsAbsPath(this._paths.config_file,true /*isFile*/);
        this._paths.config_file_sample = Utils.File.setAsAbsPath(this._paths.config_file_sample,true /*isFile*/);
        this._paths.temp_dir = Utils.File.setAsAbsPath(this._paths.temp_dir);
        this._paths.custom_indexes = Utils.File.setAsAbsPath(this._paths.custom_indexes);
        this._paths.latest_lookup = Utils.File.setAsAbsPath(this._paths.latest_lookup,true /*isFile*/);
        this._paths.samples_index = Utils.File.setAsAbsPath(this._paths.samples_index,true /*isFile*/);
        this._paths.projects_directory = null;
        this._paths.project_directory = null;
        this._paths.samples_directory = null;

        // DataManager
        DataMgr.setHolder({
            label:'config_file',
            filePath:this._paths.config_file,
            fileType:'json',
            dataType:'object',

            preLoad:true,
            cloneFrom:this._paths.config_file_sample,
            logErrorsFn:console.log
        });

        // Open config.json
        this._config = DataMgr.get('config_file');
        if(!this._config){
            Utils.EXIT('Cannot create or read the configuration file '+this.path('config_file'));
        }

        // Check and set paths [2]
       this._setInternals();

        // Create directories
        Utils.File.ensureDirSync(this.path('temp_dir'));
        Utils.File.ensureDirSync(this.path('custom_indexes'));
    }

    _parseExternalOptions(options){
        options = _.merge({
            config_file: 'config.json',
            config_file_sample: 'config.sample.json',
            temp_dir: 'temp/',
            custom_indexes: 'temp/c_indexes/',
            latest_lookup: 'temp/latest_lookup',
            samples_index: 'temp/samples_index'
        },options);
        return options;
    }


    _setInternals(){
        this._paths.samples_directory = Utils.File.checkAndSetPathSync(this._config.SamplesDirectory);
        if(!this._paths.samples_directory) UI.warning("Sample directory does not exist: ",this._config.SamplesDirectory);

        this._paths.projects_directory = Utils.File.checkAndSetPathSync(this._config.ProjectsDirectory);
        if(!this._paths.projects_directory) UI.warning("Projects directory does not exist: ",this._config.ProjectsDirectory);

        this._paths.project_directory = Utils.File.checkAndSetPathSync(Utils.File.pathJoin(this._config.ProjectsDirectory,this._config.Project));
        if(!this._paths.project_directory) UI.warning("The project directory does not exist: ",Utils.File.pathJoin(this._config.ProjectsDirectory,this._config.Project));

        UI.print();
    }


    path(name){
        return this._paths[name];
    }


    getConfigParams(){
        return Object.keys(this._config);
    }


    printInternals(){
        UI.print("\nInternal Configuration");
        let _self = this;
        UI.print("\n# Work directories");
        Object.keys(this._paths).forEach(function(v){
            UI.print("  "+v+" : "+_self._paths[v]);
        });
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
        if(_outcome.error==true){
            if(_outcome.type){
                UI.print("Config.set: current value and old value have different types.\n");
                UI.print("             old: ",this._config[name]);
                UI.print("             new: ",value);
            }
            return null;
        }
        let _new_value = this._setFinalValue(name,_outcome);
        if(_new_value===null) return null;
        DataMgr.set('config_file',this._config);
        return _new_value;
    }


    _setFinalValue(n,_outcome){
        let v = _outcome.value;

        if(n=="Project"){
            let proj_dir_ck = null;
            let proj_dir = this._config['ProjectsDirectory'];
            let ph = Utils.File.pathParse(v);
            v = ph.base || ph.name;
            if(ph.dir.length>0) proj_dir = ph.dir;

            proj_dir_ck = Utils.File.checkAndSetPathSync(proj_dir);
            if(!proj_dir_ck){
                UI.print("The projects directory does not exist: "+proj_dir);
                return null;
            }
            proj_dir = proj_dir_ck;

            proj_dir_ck = Utils.File.checkAndSetPathSync(proj_dir+v);
            if(!proj_dir_ck){
                UI.print("The project directory does not exist: "+proj_dir+v);
                return null;
            }

            this._config.ProjectsDirectory = proj_dir;
        }

        else if(n=="ProjectsDirectory"){
            let proj_dir_ck = Utils.File.checkAndSetPathSync(v);
            if(!proj_dir_ck){
                UI.print("The project directory does not exist: "+v);
                return null;
            }
            v = proj_dir_ck;
        }

        else if(n=="SamplesDirectory"){
            let ph = Utils.File.pathParse(v);
            v = Utils.File.checkAndSetPathSync(v);
            if(!v){
                UI.print("The samples directory does not exist: "+v);
                return null;
            }
            this._config.SamplesDirectory = v;
        }

        else if(_outcome.type=='array' && this._config[n].length>0){
            let _ot = this._set(this._config[n][0],v);
            if(_ot.error==true){
                if(_ot.type){
                    UI.print("Config.set [Array]: current value and old value have different types.");
                    UI.print("\n                   old: ",this._config[n][0]);
                    UI.print("\n                   new: ",v);
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
        DataMgr.set('config_file',this._config);
        return DataMgr.save('config_file');
    }

    print(){
        UI.print("\nConfiguration File");
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
            UI.print("  "+v+':'+" "+vprint);
        });
    }


    setFromCliParams(name,values){
        if(!_.isString(name) || !_.isArray(values)) return null;
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
            this._config['Tags'] = Utils.sortObjectByKey(this._config['Tags']);
        }
        return true;
    }
};

module.exports = new ConfigManager(global.ConfigManagerOptions);
