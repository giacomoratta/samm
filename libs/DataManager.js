class DataManager {
    constructor(){
        this._cfg = {};
        this._data = {};

        this.ENUMS = {
            fileType: {
                json:'json',
                json_compact:'json-compact',
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

            /* Behaviour */
            cloneFrom:'',       // if filePath does not exist, clone from this path
            preLoad:false,      // calls loadFn after creating relationship
            autoLoad:false,     // calls loadFn if it has no data
            preSet:false,       // calls setFn after creating relationship
            autoSet:false,      // calls setFn if it has no data

            /* Custom functions */
            checkFn:null,
            getFn:null,
            setFn:null,
            loadFn:null,
            saveFn:null
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


    check(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;

        if(!this.hasData(label)) return false;
        if($cfg.checkFn){
            try{
                return $cfg.checkFn(this._data[label],$cfg,args);
            }catch(e){
                d(e);
                return null;
            }
        }
        return this.hasData(label);
    }


    load(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;
        let filedata = this._loadFileData($cfg.filePath, $cfg.fileType, $cfg.cloneFrom);

        if($cfg.loadFn){
            try{
                this._data[label] = $cfg.loadFn(filedata,$cfg,args);
            }catch(e){
                d(e);
                return null;
            }
        }
        else this._data[label] = filedata;
        return this._data[label];
    }


    save(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath || !this._data[label]) return null;
        let filedata = null;

        if($cfg.saveFn){
            try{
                filedata = $cfg.saveFn(this._data[label],$cfg,args);
            }catch(e){
                d(e);
                return null;
            }
        }
        else filedata = this._data[label];
        return this._saveFileData($cfg.filePath, $cfg.fileType, filedata);
    }


    set(label,data,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;

        this._data[label]=null;
        if(data) this._data[label]=data;
        else if($cfg.setFn){
            try{
                this._data[label] = $cfg.setFn($cfg,args);
            }catch(e){
                d(e);
                return null;
            }
        }
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
        if($cfg.getFn){
            try{
                return $cfg.getFn(dataObj,$cfg,args);
            }catch(e){
                d(e);
                return null;
            }
        }
        return dataObj;
    }


    _checkEnumValue(label,value,defaultValue){
        let _check = (_.indexOf(Object.values(this.ENUMS[label]),value)>=0);
        if(_check===true) return value;
        if(!_.isNil(defaultValue)) return defaultValue;
        return null;
    }


    _loadFileData(filePath, fileType, cloneFrom){
        if(cloneFrom.length>0 && !Utils.File.fileExistsSync(filePath)){
            Utils.File.copyFileSync(cloneFrom,filePath);
        }
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

        }else if(fileType==this.ENUMS.fileType.json_compact){

            return Utils.File.writeJsonFileSync(filePath,content,false);

        }else if(fileType==this.ENUMS.fileType.text){
            return Utils.File.writeTextFileSync(filePath,content);
        }
        return null;
    }
}

module.exports = new DataManager();
