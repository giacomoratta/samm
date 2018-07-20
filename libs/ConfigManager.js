class ConfigManager {

    constructor(){
        this._config = require('../config.json');
        this._sampleScan = null;
        this.filename = {
            config: 'config.json',
            latest_lookup: 'latest_lookup.txt',
            samples_index: 'samples_index.txt'
        }
        this._labels = {
            'sample_dir':'smp'
        }
    }

    getSamplesDirectory(){
        return this._config.SamplesDirectory;
    }

    getProjectsDirectory(){
        return this._config.SamplesDirectory;
    }

    getExtensionExcludedForSamples(){
        return this._config.ExtensionExcludedForSamples;
    }

    checkProperty(name){
        return !_.isUndefined(this._config[name]);
    }

    get(name){
        return this._config[name];
    }

    set(name, values){
        if(_.isArray(this._config[name])){
            this._config[name] = values;
        }
        else if(_.isObject(this._config[name])){
            this._setObjectProperty(name, values);
        }
        else if(typeof this._config[name] === typeof values[0]){
            // preserve type
            this._config[name] = values[0];
        }
        return this._config[name];
    }

    _setObjectProperty(name, values){
        console.log('_setObjectProperty');
        if(values.length<2) return;
        let _ref = this._config[name];
        let i=0;
        for(; i<values.length-1; i++){
            if(!_.isObject(_ref[values[i]])) _ref[values[i]]={};
            if(i<values.length-2) _ref = _ref[values[i]];
        }
        _ref[values[i-1]] = values[i];
        //console.log(this._config[values[0]],this._config);
        return this._config[values[0]];
    }

    save(){
        let file_path = path.resolve(this.filename.config);
        let config_text = JSON.stringify(this._config, null, '\t');
        fs.writeFileSync(file_path, config_text, 'utf8', function(err) {
            if(err) { console.log(err); return; }
            console.log("Configuration saved successfully");
        });
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
