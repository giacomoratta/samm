const ConfigField = require('./micro/ConfigField.class.js');

class ConfigManager {

    constructor(){
        this._clUI = clUI.newLocalUI('> config manager:');
        this._fields = {};

        this._userdata_path = null;
        this._configfile_path = null;

        this._paths = {};
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
                _self.getConfigParams().forEach((k)=>{
                    if(!fileData[k]){
                        _self._clUI.warning('missing parameter from loaded configuration:',k);
                        return;
                    }
                    if(_.isNil(_self.set(k,fileData[k]))){
                        _self._clUI.warning('wrong value for parameter',k,' from loaded configuration:',fileData[k]);
                        Utils.EXIT();
                    }
                });
            }
        });
        //no save after load - eventuali errori cancellano config

        // Open config.json
        this._config = DataMgr.get('config_file');
        if(!this._config){
            if(DataMgr.set('config_file',this.toJSON())===null){
                Utils.EXIT('Cannot create or read the configuration file '+this.path('config_file'));
            }
            DataMgr.save('config_file');
        }

        this.print();
    }


    path(label){
        return this._paths[label];
    }

    addField(field_name, field_cfg){

        field_cfg.fieldname = field_name;
        field_cfg.printErrorFn = clUI.error;

        this._fields[field_name] = new ConfigField(field_cfg);
        if(this._fields[field_name].error()){
            d$('ConfigManager.addField',field_name,'ERROR');
            return;
        }
    }

    get(field_name){
        if(!this._fields[field_name]) return;
        return this._fields[field_name].get();
    }

    set(field_name, value, addt){
        if(!this._fields[field_name]) return;
        return this._fields[field_name].set(value, addt);
    }

    setFlag(label){
        this._flags[label].status = true;
    }

    unsetFlag(label){
        this._flags[label].status = false;
    }


    setUserdataDirectory(name){
        this._userdata_path = Utils.File.setAsAbsPath(name, false /*isFile*/);
        if(!Utils.File.ensureDirSync(this._userdata_path)){
            this._clUI.error('cannot ensure the user data directory or is not a valid path', this._userdata_path);
            Utils.EXIT();
        }
    }

    setConfigFile(name){
        this._configfile_path = Utils.File.setAsAbsPath(this._userdata_path + Utils.File.pathSeparator + name, true /*isFile*/);
        if(!Utils.File.isAbsoluteParentDirSync(this._configfile_path,true /*checkExists*/)){
            this._clUI.error('the parent directory of config file does not exist or is not a valid path', this._configfile_path);
            Utils.EXIT();
        }
    }

    addUserDirectory(label, rel_path){
        this._paths[label] = Utils.File.setAsAbsPath(this._userdata_path + Utils.File.pathSeparator + rel_path, false /*isFile*/);
        if(!Utils.File.ensureDirSync(this._paths[label])){
            this._clUI.error('cannot ensure the user directory or is not a valid path', this._paths[label]);
            Utils.EXIT();
        }
    }

    addUserFile(label, rel_path){
        this._paths[label] = Utils.File.setAsAbsPath(this._userdata_path + Utils.File.pathSeparator + rel_path, true /*isFile*/);
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


    getConfigParams(){
        return Object.keys(this._fields);
    }


    print(){
        clUI.print("\n",'Current Configuration:');
        let params = this.getConfigParams();
        for(let i=0; i<params.length; i++){
            clUI.print(' ',params[i]+':',this.get(params[i]));
        }
        clUI.print(); //new line
    }


    printInternals(){
        clUI.print("\n","Internal Configuration");
        let _self = this;
        Object.keys(this._paths).forEach(function(v){
            clUI.print("    "+v+" : "+_self._paths[v]);
        });
    }


    toJSON(){
        let params = this.getConfigParams();
        let pobj = {};
        for(let i=0; i<params.length; i++){
            pobj[params[i]] = this.get(params[i]);
        }
        return pobj;
    }

    printMessages(){
        clUI.print("\n");
        let k = Object.keys(this._flags);
        for(let i=0; i<k.length; i++){
            if(this._flags[k[i]].status===true){
                clUI.print(this._flags[k[i]].message);
            }
        }
        clUI.print("");
    }
}

module.exports = new ConfigManager();
