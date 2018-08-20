class DataManager {
    constructor(){
        this._file_map = new Map();
        this._obj_map = new Map();
    }

    _parseOptions(options){
        if(!options) return;
        if(!options.label) return;
        //if(!options.filePath) return; //???
        let O = _.merge({
            label:null,
            filePath:null,
            preLoad:false,
            autoLoad:false,
            checkCb:(data)=>{ },
            getCb:(data)=>{ },
            setCb:(data)=>{ }
        },options);
        return options;
    }

    _openTextFile(abspath){

    }

    setJsonFile(abspath,text){

    }

    setTextFile(abspath,text){

    }

    setObject(label,data){

    }

    set(options){
        options = this._parseOptions(options);
        if(!options) return;
        this._map[options.label] = options;
        if(options.preLoad===true){
            this._loadData(options.label);
        }
    }

    _loadData(label){

    }


    getJsonFile(abspath){

    }

    getTextFile(abspath){

    }

    getObject(label){

    }


}

module.exports = new DataManager();
