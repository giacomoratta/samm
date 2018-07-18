const _config = require('../config.json');

class Config {

    constructor(){

    }

    getSamplesDirectory(){
        return _config.SamplesDirectory;
    }

    getProjectsDirectory(){
        return _config.SamplesDirectory;
    }

    getExtensionExcludedForSamples(){
        return _config.SamplesDirectory;
    }

    checkProperty(name){
        return !_.isUndefined(_config[name]);
    }

    getProperty(name){
        return _config[name];
    }

    setProperty(name, values){
        if(_.isArray(_config[name])) _config[name] = values;
        else if(_.isObject(_config[name])) this._setObjectProperty(name, values);
        else _config[name] = values[0];
        return _config[name];
    }

    _setObjectProperty(name, values){
        console.log('_setObjectProperty');
        if(values.length<2) return;
        let _ref = _config[name];
        let i=0;
        for(; i<values.length-1; i++){
            if(!_.isObject(_ref[values[i]])) _ref[values[i]]={};
            if(i<values.length-2) _ref = _ref[values[i]];
        }
        _ref[values[i-1]] = values[i];
        //console.log(_config[values[0]],_config);
        return _config[values[0]];
    }

    save(){
        let file_path = path.resolve('config.json');
        let config_text = JSON.stringify(_config, null, '\t');
        fs.writeFileSync(file_path, config_text, 'utf8', function(err) {
            if(err) { console.log(err); return; }
            console.log("Configuration saved successfully");
        });
    }
};

module.exports = new Config();
