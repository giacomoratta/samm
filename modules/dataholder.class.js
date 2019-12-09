class dataHolder {

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
            backupTo:'',        // after save, copy the file in filePath to this path
            preLoad:false,      // calls loadFn after creating relationship
            autoLoad:false,     // calls loadFn if it has no data
            preSet:false,       // calls setFn after creating relationship
            autoSet:false,      // calls setFn if it has no data
            autoSave:false,     // calls saveFn after loadFn or setFn

            /* Custom functions */
            checkFn:null,
            initFn:null,
            getFn:null,
            setFn:null,
            loadFn:null,
            saveFn:null,
            printFn:null,
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
        if(_.isNil(this._cfg[label]) || _.isNil(this._cfg[label].filePath)) return null;
        return Utils.File.fileExistsSync(this._cfg[label].filePath);
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
            $cfg.logErrorsFn('dataHolder.setHolder > configuration not valid');
            return null;
        }

        this._cfg[$cfg.label] = $cfg;
        this._data[$cfg.label] = null;

        let _outcomeLoadSet = null;
        if($cfg.preLoad===true){
            _outcomeLoadSet = this.load($cfg.label);
            if(!this.hasData($cfg.label)) this.init($cfg.label);
            return _outcomeLoadSet;
        }
        if($cfg.preSet===true){
            _outcomeLoadSet = this.set($cfg.label);
            if(!this.hasData($cfg.label)) this.init($cfg.label);
            return _outcomeLoadSet;
        }

        this.init($cfg.label);
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
                $cfg.logErrorsFn(e);
                $cfg.logErrorsFn('dataHolder.check > checkFn callback failed');
                return null;
            }
        }
        return this.hasData(label);
    }


    init(label,args){
        let $cfg = this._cfg[label];
        if($cfg.initFn){
            try{
                this._data[label] = $cfg.initFn(this._data[label],$cfg,args);
            }catch(e){
                $cfg.logErrorsFn(e);
                $cfg.logErrorsFn('dataHolder.init > initFn callback failed');
                return null;
            }
        }
        return this.hasData(label);
    }


    load(label,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;

        let filedata = this._loadFileData($cfg);
        if(filedata === false || filedata === null){
            $cfg.logErrorsFn('dataHolder.load ['+label+'] > the file does not exist:',$cfg.filePath);
            //return false;
            filedata = null;
        }

        if($cfg.loadFn){
            try{
                let data = $cfg.loadFn(filedata,$cfg,args);
                if(!$cfg._checkDataType(data)){
                    $cfg.logErrorsFn('dataHolder.load ['+label+'] > loaded data type is not '+$cfg.dataType);
                    return null;
                }
                this._data[label]=data;
            }catch(e){
                $cfg.logErrorsFn(e);
                $cfg.logErrorsFn('dataHolder.load ['+label+'] > loadFn callback failed!');
                return null;
            }
        }
        else{
            if(!$cfg._checkDataType(filedata)){
                $cfg.logErrorsFn('dataHolder.load ['+label+'] > loaded data type is not '+$cfg.dataType);
                return null;
            }
            this._data[label]=filedata;
        }

        if($cfg.autoSave === true){
            this.save(label,args);
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
                $cfg.logErrorsFn(e);
                $cfg.logErrorsFn('dataHolder.save > saveFn callback failed!');
                return null;
            }

            if($cfg.backupTo.length>0){
                if(Utils.File.copyFileSync($cfg.filePath,$cfg.backupTo).err!==null){
                    $cfg.logErrorsFn('dataHolder.save > backup failed!');
                }
            }
        }
        else filedata = this._data[label];
        let saveoutcome = this._saveFileData($cfg, filedata);
        if(saveoutcome===null || saveoutcome===false) return null;
        return saveoutcome;
    }


    set(label,data,args){
        let $cfg = this._cfg[label];
        if(!$cfg || !$cfg.filePath) return null;

        this._data[label]=null;
        if(data){
            if(!$cfg._checkDataType(data)){
                $cfg.logErrorsFn('dataHolder.set > data type is not '+$cfg.dataType);
                return null;
            }
            this._data[label]=data;
        }
        else if($cfg.setFn){
            try{
                data = $cfg.setFn($cfg,args);
                if(!$cfg._checkDataType(data)){
                    $cfg.logErrorsFn('dataHolder.set > data type is not '+$cfg.dataType);
                    return null;
                }
                this._data[label]=data;
            }catch(e){
                $cfg.logErrorsFn(e);
                $cfg.logErrorsFn('dataHolder.set > setFn callback failed!');
                return null;
            }
        }

        if($cfg.autoSave === true){
            this.save(label,args);
        }
        return this._data[label];
    }


    get(label,args){
        let $cfg = this._cfg[label]; if(!$cfg) return null;
        let dataObj = this._data[label];
        if(!dataObj){
            if($cfg.autoLoad===true){
                dataObj = this.load($cfg.label,args);
            }else if($cfg.autoSet===true){
                dataObj = this.set($cfg.label,args);
            }
        }
        if($cfg.getFn){
            try{
                return $cfg.getFn(dataObj,$cfg,args);
            }catch(e){
                $cfg.logErrorsFn(e);
                $cfg.logErrorsFn('dataHolder.get > getFn callback failed');
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
            if(cpF.err) $cfg.logErrorsFn('dataHolder > Cloning of file failed','src: '+$cfg.cloneFrom,'dst: '+$cfg.filePath);
        }
        if($cfg.fileType===this.ENUMS.fileType.json || $cfg.fileType===this.ENUMS.fileType.json_compact){
            return Utils.File.readJsonFileSync($cfg.filePath);

        }else if($cfg.fileType===this.ENUMS.fileType.text){
            return Utils.File.readTextFileSync($cfg.filePath);

        }
        return null;
    }

    _saveFileData($cfg, content){
        if($cfg.fileType===this.ENUMS.fileType.json){
            return Utils.File.writeJsonFileSync($cfg.filePath,content);

        }else if($cfg.fileType===this.ENUMS.fileType.json_compact){
            return Utils.File.writeJsonFileSync($cfg.filePath,content,false);

        }else if($cfg.fileType===this.ENUMS.fileType.text){
            return Utils.File.writeTextFileSync($cfg.filePath,content);
        }
        return null;
    }
}

module.exports = dataHolder;
