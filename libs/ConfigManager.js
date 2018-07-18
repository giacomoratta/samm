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
        let _ref = _config[name];
        let i=1;
        for(; i<values.length; i++){
            if(!this.checkProperty(values[i-1])){
                _ref[values[i-1]]={};
            }
            _ref=_ref[values[i-1]];
        }
        _config[name] = values[i-1];
    }

    save(){
        fs.writeFile('../config.json', JSON.stringify(_config, null, '\t'), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Configuration saved successfully");
        });
    }
};

module.exports = new Config();
