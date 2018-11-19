class Bookmarks {

    constructor(){
        this._data = {
            _: this._newBookmNode()
        };
        this._size = 0;
    }

    _newBookmNode(){
        return new Samples();
    }

    empty(){
        return (this._size===0);
    }

    size(){
        return this._size;
    }

    add1(bdata,label){
        let _bobj = null;
        if(!_.isString(label)){
            if(_.indexOf(this._data._.array,bdata)>=0) return false;
            _bobj = this._data._;
        }else{
            if(!_.isObject(this._data[label])){
                this._data[label] = this._newBookmNode();
            }
            if(_.indexOf(this._data[label].array,bdata)>=0) return false;
            _bobj = this._data[label];
        }
        _bobj.array.push(bdata);
        _bobj.info.size++;
        this._size++;
        return true;
    }


    remove1(bdata,label){
        let _bobj = null;
        if(!_.isString(label)){
            _bobj = this._data._;
        }else{
            if(!_.isObject(this._data[label])){
                return false;
            }
            _bobj = this._data[label];
        }
        let index = _.indexOf(_bobj.array,bdata);
        if(index<0) return false;
        _bobj.array.splice(index,0);
        _bobj.info.size--;
        this._size--;
        return true;
    }


    forEach(label,cb){
        if(_.isString(label)){
            this._forEachValues(label, cb, 0/*index*/);
            return;
        }
        this._forEachAll(cb);
    }


    _forEachValues(label,cb,index){
        let diffLb=true;
        this._data[label].array.forEach((value)=>{
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
        this._data = jsondata.data;
        this._size = jsondata.size;
    }


    toJson(){
        return {
            size:this._size,
            data:this._data
        }
    }
}

module.exports = Bookmarks;