class ConfigManager {

    constructor(){
        this._sampleScan = null;
        this._filename = {
            config: 'config.json',
            latest_lookup: 'temp/latest_lookup',
            samples_index: 'temp/samples_index'
        };
        this._labels = {
            'sample_dir':'mpl'
        };
        this._config = require('../'+this._filename.config);
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
