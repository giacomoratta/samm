class DataManager {
    constructor(){
        this._cfg = {};
        this._data = {};

        this.ENUMS = {
            fileType: {
                json:'json',
                text:'text',
            }
        };
    }

    _parseConfiguration($cfg){
        if(!$cfg) return null;
        if(!$cfg.label) return null;
        //if(!options.filePath) return null; //???
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
        _$cfg.fileType = this._checkEnumValue('fileType',_$cfg.fileType,this.ENUMS.fileType.json);
        return _$cfg;
    }


    hasData(label){
        return !_.isNil(this._data[label]);
    }

    hasHolder(label){
        return _.isObject(this._cfg[label]);
    }


    setHolder($cfg){
        $cfg = this._parseConfiguration($cfg);
        if(!$cfg) return null;
        this._cfg[$cfg.label] = $cfg;
        if($cfg.preLoad===true){
            this.load($cfg.label);
        }
        if($cfg.preSet===true){
            this.set($cfg.label);
        }
    }


    $cfg(label){
        return this._cfg[label];
    }


    load(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath || !$cfg.loadFn) return null;
        let filedata = this._loadFileData($cfg.filePath, $cfg.fileType);

        this._data[label] = $cfg.loadFn(filedata,$cfg,args);
        return this._data[label];
    }


    save(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath || !$cfg.saveFn || !this._data[label]) return null;

        let filedata = $cfg.saveFn(this._data[label],$cfg,args);
        return this._saveFileData($cfg.filePath, $cfg.fileType, filedata);
    }


    set(label,data,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;

        this._data[label]=null;
        if(data) this._data[label]=data;
        else if($cfg.setFn) this._data[label] = $cfg.setFn($cfg,args);
        return this._data[label];
    }


    get(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg) return null;
        let dataObj = this._data[label];
        if(!dataObj){
            if($cfg.preLoad===true){
                dataObj = this.load($cfg.label,args);
            }else if($cfg.preSet===true){
                dataObj = this.set($cfg.label,args);
            }
        }
        if($cfg.getFn) return $cfg.getFn(dataObj,$cfg,args);
        return dataObj;
    }


    _checkEnumValue(label,value,defaultValue){
        let _check = (_.indexOf(value,Object.values(this.ENUMS[label]))>=0);
        if(_check===true) return value;
        if(!_.isNil(defaultValue)) return defaultValue;
        return null;
    }


    _loadFileData(filePath, fileType){
        if(fileType==this.ENUMS.fileType.json){
            return Utils.File.readJsonFileSync(filePath);
        }else if(fileType==this.ENUMS.fileType.text){
            return Utils.File.readTextFileSync(filePath);
        }
        return null;
    }

    _saveFileData(filePath, fileType, content){
        if(fileType==this.ENUMS.fileType.json){
            return Utils.File.writeJsonFileSync(filePath,content);
        }else if(fileType==this.ENUMS.fileType.text){
            return Utils.File.writeTextFileSync(filePath,content);
        }
        return null;
    }
}

module.exports = new DataManager();
