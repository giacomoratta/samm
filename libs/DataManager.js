class DataManager {
    constructor(){
        this._cfg = {};
        this._data = {};

        this.ENUMS = {
            fileType: {
                json:'json',
                json_compact:'json-compact',
                text:'text',
            },
            dataType: {
                object:'object',
                string:'string',
                array:'array'
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
            dataType:'object',

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
            saveFn:null,
            logErrorsFn:function(){},

            /* Private functions */
            _checkDataType: null
        };

        let _$cfg = _.merge(_default$cfg,$cfg);
        _$cfg.fileType = this._checkEnumValue('fileType',_$cfg.fileType,this.ENUMS.fileType.json);
        _$cfg.dataType = this._checkEnumValue('dataType',_$cfg.dataType,this.ENUMS.dataType.object);
        _$cfg._checkDataType = this._setcheckDataTypeFn(_$cfg.dataType);
        return _$cfg;
    }


    fileExistsSync(label){
        if(_.isNil(this._data[label]) || _.isNil(this._data[label].filePath)) return null;
        return Utils.File.fileExistsSync(this._data[label].filePath);
    }


    hasData(label){
        return !_.isNil(this._data[label]);
    }

    hasHolder(label){
        return _.isObject(this._cfg[label]);
    }


    setHolder($cfg){
        $cfg = this._parseConfiguration($cfg);
        if(!$cfg) {
            $cfg.logErrorsFn('DataMgr.setHolder > configuration not valid');
            return null;
        }

        this._cfg[$cfg.label] = $cfg;
        this._data[$cfg.label] = null;

        if($cfg.preLoad===true){
            return this.load($cfg.label);
        }
        if($cfg.preSet===true){
            return this.set($cfg.label);
        }
        return true;
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
                $cfg.logErrorsFn('DataMgr.check > checkFn callback failed');
                return null;
            }
        }
        return this.hasData(label);
    }


    load(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;

        let filedata = this._loadFileData($cfg);
        if(filedata === false){
            $cfg.logErrorsFn('DataMgr.load > the file does exist');
            return false;
        }

        if($cfg.loadFn){
            try{
                let data = $cfg.loadFn(filedata,$cfg,args);
                if(!$cfg._checkDataType(data)){
                    $cfg.logErrorsFn('DataMgr.load > loaded data type is not '+$cfg.dataType);
                    return null;
                }
                this._data[label]=data;
            }catch(e){
                d(e);
                $cfg.logErrorsFn('DataMgr.load > loadFn callback failed!');
                return null;
            }
        }
        else{
            if(!$cfg._checkDataType(filedata)){
                $cfg.logErrorsFn('DataMgr.load > loaded data type is not '+$cfg.dataType);
                return null;
            }
            this._data[label]=filedata;
        }
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
                $cfg.logErrorsFn('DataMgr.save > saveFn callback failed!');
                return null;
            }
        }
        else filedata = this._data[label];
        return this._saveFileData($cfg, filedata);
    }


    set(label,data,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;

        this._data[label]=null;
        if(data){
            if(!$cfg._checkDataType(data)){
                $cfg.logErrorsFn('DataMgr.set > data type is not '+$cfg.dataType);
                return null;
            }
            this._data[label]=data;
        }
        else if($cfg.setFn){
            try{
                data = $cfg.setFn($cfg,args);
                if(!$cfg._checkDataType(data)){
                    $cfg.logErrorsFn('DataMgr.set > data type is not '+$cfg.dataType);
                    return null;
                }
                this._data[label]=data;
            }catch(e){
                d(e);
                $cfg.logErrorsFn('DataMgr.set > setFn callback failed!');
                return null;
            }
        }
        return this._data[label];
    }


    get(label,args){
        let $cfg = this._cfg[label]; if(!$cfg) return null;
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
                $cfg.logErrorsFn('DataMgr.get > getFn callback failed');
                return null;
            }
        }
        return dataObj;
    }


    print(label,args){
        let $cfg = this._cfg[label]; if(!$cfg) return null;
        let dataObj = this.get(label,args);
        if($cfg.printFn){
            return $cfg.printFn(dataObj,$cfg,args);
        }
    }


    _checkEnumValue(label,value,defaultValue){
        let _check = (_.indexOf(Object.values(this.ENUMS[label]),value)>=0);
        if(_check===true) return value;
        if(!_.isNil(defaultValue)) return defaultValue;
        return null;
    }


    _setcheckDataTypeFn(dataType){
        if(this.ENUMS.dataType.array === dataType){
            return _.isArray;
        }else if(this.ENUMS.dataType.string === dataType){
            return _.isString;
        }
        return _.isObject;
    }


    _loadFileData($cfg){
        if($cfg.cloneFrom.length>0 && !Utils.File.fileExistsSync($cfg.filePath)){
            let cpF = Utils.File.copyFileSync($cfg.cloneFrom,$cfg.filePath);
            if(cpF.err) $cfg.logErrorsFn('DataMgr > Cloning of file failed','src: '+$cfg.cloneFrom,'dst: '+$cfg.filePath);
        }
        if($cfg.fileType==this.ENUMS.fileType.json){
            return Utils.File.readJsonFileSync($cfg.filePath);

        }else if($cfg.fileType==this.ENUMS.fileType.text){
            return Utils.File.readTextFileSync($cfg.filePath);

        }
        return null;
    }

    _saveFileData($cfg, content){
        if($cfg.fileType==this.ENUMS.fileType.json){
            return Utils.File.writeJsonFileSync($cfg.filePath,content);

        }else if($cfg.fileType==this.ENUMS.fileType.json_compact){
            return Utils.File.writeJsonFileSync($cfg.filePath,content,false);

        }else if($cfg.fileType==this.ENUMS.fileType.text){
            return Utils.File.writeTextFileSync($cfg.filePath,content);
        }
        return null;
    }
}

module.exports = new DataManager();
