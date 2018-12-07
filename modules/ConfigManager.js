// TODO sample configuration
// TODO detect OS or FS type
// TODO exit on error config
// TODO a checkFn for each single parameter (checks, messages, etc.)
// TODO globalCheckFn

const ConfigField = require('./micro/ConfigField.class.js');


class ConfigManager {

    constructor(){
        this._clUI = clUI.newLocalUI('> config:');
        this._fields = {};
        this._userdata_path = null;
        this._paths = {};

        this._paths.config_file = Utils.File.setAsAbsPath(this._paths.config_file,true /*isFile*/);
        this._paths.userdata_dir = Utils.File.setAsAbsPath(this._paths.userdata_dir);
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

    print(){
        let keys = Object.keys(this._fields);
        for(let i=0; i<keys.length; i++){
            clUI.print(' ',keys[i]+':',this._fields[keys[i]].get());
        }
        clUI.print(); //new line
    }


    init(){

        if(!this.path('config_json')) this.addUserPath('config_json');
    }


    setUserData(name){
        this._userdata_path = Utils.File.setAsAbsPath(name + Utils.File.pathSeparator, false /*isFile*/);
        if(!Utils.File.ensureDirSync(this._userdata_path)){
            this._clUI.error('cannot ensure the user data directory or is not a valid path', this._userdata_path);
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

    setFlag(label){
        this._flags[label].status = true;
    }

    unsetFlag(label){
        this._flags[label].status = false;
    }

    path(label){
        return this._paths[label];
    }

    getConfigParams(){
        return Object.keys(this._fields);
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
