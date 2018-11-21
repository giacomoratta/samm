class Bookmarks {

    constructor(){
        this._data = {
            _: this._newBookmNode()
        };
        this._size = 0;
    }

    _newBookmNode(){
        return new Samples(ConfigMgr.get('SamplesDirectory'));
    }

    empty(){
        return (this._size===0);
    }

    size(){
        return this._size;
    }


    getByIndex(index){
        let keys = Object.keys(this._data);
        let fIndex = -1;
        let fLabel = '_';
        let fObj = null;
        let totalCount = 0;
        for(let i=0; i<keys.length; i++){
            fObj = this._data[keys[i]];
            totalCount += this._data[keys[i]].size();
            if(index < totalCount){
                fIndex = index - (totalCount-this._data[keys[i]].size());
                fLabel = keys[i];
                break;
            }
        }
        if(fIndex===-1) return null;
        let _return = {
            index: fIndex,
            label: fLabel,
            smpobj: fObj.get(fIndex)
        };
        if(!_return.smpobj) return null;
        return _return;
    }


    printIndexedList(printFn){
        let keys = Object.keys(this._data);
        let printLabels = keys.length>1;
        let index=0;
        printFn('');
        for(let i=0; i<keys.length; i++){
            if(this._data[keys[i]].empty()) continue;
            if(printLabels){
                if(keys[i]==='_') printFn('Unlabeled:');
                else printFn(keys[i]+':');
            }
            this._data[keys[i]].forEach((v)=>{
                printFn('  ' + (index+1) + ') ' + v.rel_path);
                index++;
            });
            printFn('');
        }
    }


    add(elmt,label){
        if(!_.isString(label)) label='_';
        if(!this._data[label]) this._data[label]=this._newBookmNode();
        if(this._data[label].add(elmt,true /*no clone*/)===true){
            this._size++;
            return true;
        }
        return false;
    }


    remove(elmt,label){
        if(!_.isString(label)) label='_';
        if(!this._data[label]) return false;
        return this._data[label].remove(elmt);  //boolean
    }


    cloneStructure(){
        let newBookm = new this.constructor();
        this.forEach((value,index,label)=>{
            newBookm.add(value,label);
        });
        return newBookm;
    }


    cloneSubStructure(label){
        let newBookm = new this.constructor();
        if(!this._data[label]){
            return newBookm;
        }
        this.forEach(label,(value)=>{
            newBookm.add(value);
        });
        return newBookm;
    }


    forEach(label,cb){
        if(_.isString(label)){
            this._forEachValues(label, cb, 0/*index*/);
            return;
        }
        cb=label;
        this._forEachAll(cb);
    }


    _forEachValues(label,cb,index){
        let diffLb=true;
        this._data[label].forEach((value)=>{
            cb(value,index,label,diffLb);
            diffLb=false;
            index++;
        });
        return index;
    }


    _forEachAll(cb){
        let bkeys = Object.keys(this._data);
        let index=0;
        bkeys.forEach((label)=>{
            index=this._forEachValues(label,cb,index);
        });
    }


    fromJson(jsondata){
        let keys = Object.keys(jsondata.collection);
        for(let i=0; i<keys.length; i++){
            if(jsondata.collection[keys[i]].length===0) continue;
            jsondata.collection[keys[i]].forEach((v)=>{
                let phi = new PathInfo();
                phi.fromJson(v);
                this.add(phi,keys[i]);
            });
        }
    }


    toJson(){
        let jsondata = {
            size:this._size,
            collection:{}
        };
        this.forEach((value,index,label,diffLb)=>{
            if(!_.isObject(value)) return;
            if(diffLb===true) jsondata.collection[label]=[];
            jsondata.collection[label].push(value.toJson());
        });
        return jsondata;
    }
}

module.exports = Bookmarks;