class ConfigManager {

    constructor(){
        this._config = require('../config.json');
        this._sampleScan = null;
        this._filename = {
            config: 'config.json',
            latest_lookup: 'temp/latest_lookup',
            samples_index: 'temp/samples_index'
        }
        this._labels = {
            'sample_dir':'mpl'
        }
    }

    checkProperty(name){
        return !_.isUndefined(this._config[name]);
    }

    get(name){
        return this._config[name];
    }

    set(name, value){
        if(_.isArray(this._config[name])){
            if(!_.isArray(value)) {
                // no conversion
                return null;
            }
            this._config[name] = value;
            return value;
        }
        if(_.isObject(this._config[name])){
            if(!_.isObject(value)) {
                // no conversion
                return null;
            }
            this._config[name] = value;
            return value;
        }
        if(_.isInteger(this._config[name])){
            if(!_.isInteger(value)) {
                if(!_.isString(value)) return null;
                value = Utils.strToInteger(value);
                if(_.isNil(value)) return null;
            }
            this._config[name] = value;
            return value;
        }
        if(_.isNumber(this._config[name])){
            if(!_.isNumber(value)) {
                if(!_.isString(value)) return null;
                value = Utils.strToFloat(value);
                if(_.isNil(value)) return null;
            }
            this._config[name] = value;
            return value;
        }
        if(_.isString(this._config[name])){
            value = Utils.strToString(value);
            if(_.isNil(value)) return null;
            this._config[name] = value;
            return value;
        }
        return null;
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
        let json_string = JSON.stringify(this._config, null, '   ');
        let lines = json_string.split('\n');
        lines.splice(0,1);
        lines.pop();
        json_string = lines.join('\n');
        console.log(json_string);
    }
};

module.exports = new ConfigManager();
