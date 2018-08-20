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

    load(label){
        if(!this._map[label]) return;
        if(!this._map[label].filePath) return;
        // read file
        // this._map[label]
    }


    set(label,data){
        if(!this._map[label]) return;
        if(!this._map[label].filePath) return;
        // read file
        // this._map[label]
    }


    save(label){

    }


    get(label){
        let _data = this._data[label];
        if(!t_data){
            if($cfg.preLoad===true){
                this.load($cfg.label);
            }else if($cfg.preSet===true){
                this.set($cfg.label);
            }
        }

    }


    check(label){

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
