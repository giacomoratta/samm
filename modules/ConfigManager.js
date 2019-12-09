const configField = require('./atoms/configField.class.js');

class ConfigManager {

    constructor(){
        this._clUI = clUI.newLocalUI('> config manager:');
        this._fields = {};
        this._flags = {};

        this._userdata_path = null;
        this._userdata_dirname = null;
        this._configfile_path = null;

        this._paths = {};
        this._cfg_paths = {};

        this._mixed_cache = {};
        this._readonly_data = {};
    }

    _sanitize(){
        //TODO: update config.json with new fields with default values
    }

    init(){
        const _self = this;

        DataMgr.setHolder({
            label:'config_file',
            filePath:this._configfile_path,
            fileType:'json',
            dataType:'object',
            preLoad:true,
            logErrorsFn:d$,
            loadFn:(fileData)=>{
                if(!_.isObject(fileData)) return { emptydata:true };
                _self.getConfigParams().forEach((k)=>{
                    if(_.isNil(fileData[k])){
                        _self._clUI.warning('missing parameter from loaded configuration:',k,typeof fileData[k]);
                        return null;
                    }
                    if(_.isNil(_self.set(k,fileData[k]))){
                        _self._clUI.warning('wrong value for parameter',k,' from loaded configuration:',fileData[k]);
                        Utils.EXIT();
                    }
                });
                _self._flagsStatusFromJSON(fileData._flags_status);
                return fileData;
            },
            saveFn:()=>{
                //do not save after load - it's not needed and there is a possible config file cancellation after some unexpected errors
                let fileData = {};
                _self.getConfigParams().forEach((k)=>{
                    fileData[k] = _self.get(k,true /*original value*/);
                });
                fileData._flags_status = _self._flagsStatusToJSON();
                return fileData;
            }
        });

        // Open config.json
        if(!DataMgr.get('config_file') || DataMgr.get('config_file').emptydata===true){
            // generate the first config.json file
            if(this.save('config_file')===null){
                Utils.EXIT('Cannot create or read the configuration file '+this._configfile_path);
            }
        }
    }


    exists(field_name){
        return _.isObject(this._fields[field_name]);
    }


    save(){
        return DataMgr.save('config_file');
    }


    path(label){
        return this._paths[label];
    }


    cfg_path(label){
        return this._cfg_paths[label];
    }

    _set_cfg_paths(field_name){
        let raw_path = this._fields[field_name].get();
        this._cfg_paths[field_name] = null;
        if(!_.isString(raw_path) || raw_path.length<2){
            d$('_set_cfg_paths:','not a valid string for path for'+field_name,'=',raw_path);
            return false;
        }
        if(this._fields[field_name].dataType.isAbsPath===true){
            if(!Utils.File.isAbsolutePath(raw_path)) {
                d$('_set_cfg_paths:','not a valid absolute path for'+field_name,raw_path);
                return false;
            }
        }else if(this._fields[field_name].dataType.isRelPath===true){
            if(!Utils.File.isRelativePath(raw_path)) {
                d$('_set_cfg_paths:','not a valid relative path for'+field_name,raw_path);
                return false;
            }
            raw_path = Utils.File.setAsAbsPath(raw_path + Utils.File.pathSeparator, (dataType.isRelFilePath));
        }
        this._cfg_paths[field_name] = raw_path;
        return true;
    }


    addField(field_name, field_cfg){

        field_cfg.fieldname = field_name;
        field_cfg.printErrorFn = clUI.error;

        this._fields[field_name] = new configField(field_cfg);
        if(this._fields[field_name].error()){
            d$('ConfigManager.addField',field_name,'ERROR');
            return false;
        }

        if(this._fields[field_name].dataType.isPath===true){
            this._set_cfg_paths(field_name);
        }
        return true;
    }


    get(field_name, _origvalue){
        if(!this._fields[field_name]) return;
        if(this._fields[field_name].dataType.isPath===true && _origvalue!==true){
            return this.cfg_path(field_name);
        }
        return this._fields[field_name].get();
    }


    setFromCli(field_name, values, parse_string){
        if(!this._fields[field_name]) return;
        let set_outcome = true;
        if(this._fields[field_name].dataType.isArray===true){
            let in_elmts=[], out_elmts=[];
            values.forEach((v)=>{
                v=_.trim(v);
                if(v.startsWith('!')) out_elmts.push(v.substring(1));
                else in_elmts.push(v);
            });
            if(in_elmts.length>0) set_outcome = set_outcome && this._set(field_name, in_elmts,'i',parse_string /*parse*/);
            if(out_elmts.length>0) set_outcome = set_outcome && this._set(field_name, out_elmts,'d',parse_string /*parse*/);
        }
        else if(this._fields[field_name].dataType.isObject===true){
            if(!_.isString(values[1]) || (_.trim(values[i])).length<1) values[1]=null;
            set_outcome = set_outcome && this._set(field_name, values[0], values[1], parse_string /*parse*/);
        }else{
            set_outcome = set_outcome && this._set(field_name, values[0], null, parse_string /*parse*/);
        }
        return set_outcome;
    }


    set(field_name, value, addt){
        if(!this._fields[field_name]) return false;
        return this._set(field_name, value, addt, false /*parse*/);
    }


    _set(field_name, value, addt, parse){
        let _self = this;
        let set_outcome = this._fields[field_name].set(value, addt, parse);
        if(set_outcome === true){

            if(this._fields[field_name].dataType.isPath===true){
                this._set_cfg_paths(field_name);
            }

            if(!this._fields[field_name].flagsOnChange()) return true;
            this._fields[field_name].flagsOnChange().forEach((v)=>{
                _self.setFlag(v);
            });
        }
        return set_outcome;
    }


    fieldFn(field_name, fn_name, options, addt){
        if(!this._fields[field_name]) return false;
        if(!this._fields[field_name].customFn(fn_name)) return false;
        options = _.merge({
            set:false,
            error:false,
            data:{}
        },options);
        let newFieldValue = this._fields[field_name].customFn(fn_name)(this.get(field_name),options.data);
        if(options.set===true){
            if(this.set(field_name,newFieldValue,addt)!==true) options.error=true;
        }
        return newFieldValue;
    }


    setFlag(label){
        this._flags[label].status = true;
    }

    unsetFlag(label){
        this._flags[label].status = false;
    }


    _flagsStatusToJSON(){
        let keys = Object.keys(this._flags);
        let flagsobj = {};
        keys.forEach((v)=>{
            flagsobj[v] = this._flags[v].status;
        });
        return flagsobj;
    }

    _flagsStatusFromJSON(flags_status){
        let keys = Object.keys(flags_status);
        keys.forEach((v)=>{
            this._flags[v].status = flags_status[v];
        });
    }



    setSharedDirectory(name){
        this._shareddata_path = Utils.File.setAsAbsPath('../'+name, false /*isFile*/);
        if(!Utils.File.ensureDirSync(this._shareddata_path)){
            this._clUI.error('cannot ensure the common data directory or is not a valid path', this._shareddata_path);
            Utils.EXIT();
        }
    }

    addSharedFile(label, rel_path){
        this._paths[label] = Utils.File.setAsAbsPath(rel_path, true /*isFile*/, this._shareddata_path + Utils.File.pathSeparator);
        if(!Utils.File.isAbsoluteParentDirSync(this._paths[label],true /*checkExists*/)){
            this._clUI.error('the parent directory does not exist or is not a valid path', this._paths[label]);
            Utils.EXIT();
        }
    }

    addSharedDirectory(label, rel_path){
        this._paths[label] = Utils.File.setAsAbsPath(rel_path, false /*isFile*/, this._shareddata_path + Utils.File.pathSeparator);
        if(!Utils.File.ensureDirSync(this._paths[label])){
            this._clUI.error('cannot ensure the user directory or is not a valid path', this._paths[label]);
            Utils.EXIT();
        }
    }


    setUserdataDirectory(name){
        this._userdata_path = Utils.File.setAsAbsPath(name, false /*isFile*/);
        if(!Utils.File.ensureDirSync(this._userdata_path)){
            this._clUI.error('cannot ensure the user data directory or is not a valid path', this._userdata_path);
            Utils.EXIT();
        }
        this._userdata_dirname = Utils.File.pathBasename(this._userdata_path);
    }

    setConfigFile(name){
        this._configfile_path = Utils.File.setAsAbsPath(this._userdata_dirname + Utils.File.pathSeparator + name, true /*isFile*/);
        if(!Utils.File.isAbsoluteParentDirSync(this._configfile_path,true /*checkExists*/)){
            this._clUI.error('the parent directory of config file does not exist or is not a valid path', this._configfile_path);
            Utils.EXIT();
        }
    }

    addUserDirectory(label, rel_path){
        this._paths[label] = Utils.File.setAsAbsPath(this._userdata_dirname + Utils.File.pathSeparator + rel_path, false /*isFile*/);
        if(!Utils.File.ensureDirSync(this._paths[label])){
            this._clUI.error('cannot ensure the user directory or is not a valid path', this._paths[label]);
            Utils.EXIT();
        }
    }

    addUserFile(label, rel_path){
        this._paths[label] = Utils.File.setAsAbsPath(this._userdata_dirname + Utils.File.pathSeparator + rel_path, true /*isFile*/);
        if(!Utils.File.isAbsoluteParentDirSync(this._paths[label],true /*checkExists*/)){
            this._clUI.error('the parent directory does not exist or is not a valid path', this._paths[label]);
            Utils.EXIT();
        }
    }

    addFlag(label, message, status){
        if(!_.isBoolean(status)) status=false;
        this._flags[label] = {
            status: status,
            message: message
        }
    }


    loadReadOnlyData(label,path_string){
        this._readonly_data[label] = Utils.File.readJsonFileSync(path_string);
    }

    readOnlyData(label){
        return this._readonly_data[label];
    }


    getConfigParams(){
        return Object.keys(this._fields);
    }


    print(){
        clUI.print("\n",'Current Configuration:');
        let params = this.getConfigParams();

        let _mlen1 = this._mixed_cache.print_mlen1;
        if(_.isNil(_mlen1)){
            _mlen1=0;
            params.forEach((v)=>{ if(_mlen1<v.length) _mlen1=v.length; }); _mlen1+=7;
            this._mixed_cache.print_mlen1 = _mlen1;
        }

        for(let i=0; i<params.length; i++){
            let pvalue = this.get(params[i], true /*original value*/);
            if(_.isNil(pvalue) || _.isNaN(pvalue)) pvalue='<undefined>';
            if((_.isString(pvalue) && pvalue.length===0) || (_.isArray(pvalue) && pvalue.length===0)) pvalue='<empty>';
            if(_.isArray(pvalue)) pvalue='[set] '+pvalue.join(', ');
            clUI.print('  ',_.padEnd(params[i]+(params[i].length%2===0?' ':''),_mlen1,' .'),pvalue);
        }
        clUI.print(); //new line
    }


    printInternals(){
        let _self = this;
        let _paths_keys = Object.keys(this._paths);
        let _cfg_paths_keys = Object.keys(this._cfg_paths);
        let _flags_keys = Object.keys(this._flags);

        let pad_end1=16;
        let pad_end2 = this._mixed_cache.print_pad_end2;
        if(_.isNil(pad_end2)){
            pad_end2 = 1;
            _paths_keys.forEach((v)=>{ if(pad_end2<v.length) pad_end2=v.length; });
            _cfg_paths_keys.forEach((v)=>{ if(pad_end2<v.length) pad_end2=v.length; });
            _flags_keys.forEach((v)=>{ if(pad_end2<v.length) pad_end2=v.length; });
            pad_end2+=3;
            this._mixed_cache.print_pad_end2 = pad_end2;
        }

        clUI.print("\n","Internal Configuration");
        clUI.print(_.padEnd("   (private)",pad_end1),_.padEnd("userdata path: ",pad_end2),_self._userdata_path);
        clUI.print(_.padEnd("   (private)",pad_end1),_.padEnd("config file path: ",pad_end2),_self._configfile_path);
        _paths_keys.forEach(function(v){
            clUI.print(_.padEnd("   (path)",pad_end1),_.padEnd(v+": ",pad_end2),(_.isNil(_self._paths[v])?'<undefined>':_self._paths[v]));
        });
        _cfg_paths_keys.forEach(function(v){
            clUI.print(_.padEnd("   (cfg-path)",pad_end1),_.padEnd(v+": ",pad_end2),(_.isNil(_self._cfg_paths[v])?'<undefined>':_self._cfg_paths[v]));
        });
        _flags_keys.forEach(function(v){
            clUI.print(_.padEnd("   (flag)",pad_end1),_.padEnd(v+": ",pad_end2),'[status:'+_self._flags[v].status+']',_self._flags[v].message);
        });
        clUI.print(); //new line
    }


    printMessages(){
        let k = Object.keys(this._flags);
        let str = '';
        for(let i=0; i<k.length; i++){
            if(this._flags[k[i]].status===true){
                str += '[App Warning] '+this._flags[k[i]].message+"\n";
            }
        }
        if(str.length===0) return;
        clUI.print("\n");
        clUI.print(str);
    }

}

module.exports = new ConfigManager();
