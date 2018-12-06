// TODO sample configuration
// TODO detect OS or FS type
// TODO exit on error config
// TODO a checkFn for each single parameter (checks, messages, etc.)
// TODO globalCheckFn

const ConfigField = require('./micro/ConfigField.class.js');


class ConfigManager {

    constructor(){
        this._fields = {};
        this._paths = {};
        this._upaths = {};
    }


    addField(field_name, field_cfg){
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
        clUI.print();
    }


    setUserDirectory(name){
    }

    addUserFile(label, rel_path){
    }

    addUserDirectory(label, rel_path){
    }

    path(){}

    getConfigParams(){}

    printMessages(){}
}

module.exports = new ConfigManager();
