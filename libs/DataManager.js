class DataManager {
    constructor(){
        this._file_map = new Map();
        this._obj_map = new Map();
    }

    _parseConfiguration($cfg){
        if(!$cfg) return;
        if(!$cfg.label) return;
        //if(!options.filePath) return; //???
        let _default$cfg = {
            label:null,
            filePath:null,
            fileType:'json',
            preLoad:false,
            autoLoad:false,
            preSet:false,
            autoSet:false,
            checkFn:(data)=>{ },
            getFn:(data)=>{ },
            setFn:(data)=>{ },
            loadFn:(data)=>{ },
            saveFn:(data)=>{ }
        };
        let _$cfg = _.merge(_default$cfg,$cfg);
        if(_.indexOf(_$cfg.fileType,['json','text'])<0) _$cfg.fileType='json';
        return _$cfg;
    }

    _openTextFile(abspath){

    }

    setJsonFile(abspath,text){

    }

    setTextFile(abspath,text){

    }

    setObject(label,data){

    }

    setRelationship($cfg){
        $cfg = this._parseConfiguration($cfg);
        if(!$cfg) return;
        this._map[$cfg.label] = $cfg;
        if($cfg.preLoad===true){
            this._loadFile($cfg.label);
        }
    }

    _loadFile(label){
        if(!this._map[label]) return;
        if(!this._map[label].filePath) return;
        // read file
        // this._map[label]
    }


    getJsonFile(abspath){

    }

    getTextFile(abspath){

    }

    getObject(label){

    }


}

module.exports = new DataManager();
