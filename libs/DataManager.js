class DataManager {
    constructor(){
        this._cfg = {};
        this._data = {};
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
            checkFn:null,
            getFn:null,
            setFn:null,
            loadFn:null,
            saveFn:null,
        };
        let _$cfg = _.merge(_default$cfg,$cfg);
        if(_.indexOf(_$cfg.fileType,['json','text'])<0) _$cfg.fileType='json';
        return _$cfg;
    }


    hasData(label){
        return !_.isNil(this._data[label]);
    }

    hasRelationship(label){
        return _.isObject(this._cfg[label]);
    }


    setRelationship($cfg){
        $cfg = this._parseConfiguration($cfg);
        if(!$cfg) return;
        this._cfg[$cfg.label] = $cfg;
        if($cfg.preLoad===true){
            this.load($cfg.label);
        }
        if($cfg.preSet===true){
            this.set($cfg.label);
        }
    }


    load(label,args){
        let $cfg = this._map[label];
        if(!$cfg || !$cfg.filePath || !$cfg.loadFn) return;
        let filedata = this._loadFileData($cfg.filePath, $cfg.fileType);

        this._data[label] = $cfg.loadFn(filedata,$cfg,args);
        return this._data[label];
    }


    save(label,args){
        let $cfg = this._map[label];
        if(!$cfg || !$cfg.filePath || !$cfg.saveFn || !this._data[label]) return;

        let filedata = $cfg.saveFn(this._data[label],$cfg,args);
        return this._saveFileData(filedata, $cfg.filePath, $cfg.fileType);
    }


    set(label,data,args){
        let $cfg = this._map[label];
        if(!$cfg || !$cfg.filePath || !$cfg.setFn) return;

        this._data[label]=null;
        if(data) this._data[label]=data;
        else this._data[label] = $cfg.setFn($cfg,args);
        return this._data[label];
    }


    get(label,args){
        let $cfg = this._map[label];
        if(!$cfg) return;
        let dataObj = this._data[label];
        if(!dataObj){
            if($cfg.preLoad===true){
                dataObj = this.load($cfg.label,args);
            }else if($cfg.preSet===true){
                dataObj = this.set($cfg.label,args);
            }
        }
        if(!$cfg.getFn) return dataObj;
        return $cfg.getFn(dataObj,$cfg,args);
    }


    check(label,args){

    }


    _openTextFile(abspath){

    }

    setJsonFile(abspath,text){

    }

    setTextFile(abspath,text){

    }

    setObject(label,data){

    }






    getJsonFile(abspath){

    }

    getTextFile(abspath){

    }

    getObject(label){

    }


}

module.exports = new DataManager();
