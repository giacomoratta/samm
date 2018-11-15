class Bookmarks {

    constructor(){
        this.data = {
            _:this._newBookmNode()
        }
    }

    _newBookmNode(){
        return {
            info:{},
            array:[]
        };
    }


    add(bdata,label){
        if(!_.isString(label)){
            if(_.indexOf(this.data._.array,bdata)>=0) return false;
            this.data._.array.push(bdata);
        }else{
            if(!_.isObject(this.data[label])){
                this.data[label] = this._newBookmNode();
            }
            if(_.indexOf(this.data[label].array,bdata)>=0) return false;
            this.data[label].array.push(bdata);
        }
        return true;
    }


    remove(bdata,label){
        let _bobj = null;
        if(!_.isString(label)){
            _bobj = this.data._;
        }else{
            if(!_.isObject(this.data[label])){
                return false;
            }
            _bobj = this.data[label];
        }
        let index = _.indexOf(_bobj.array,bdata);
        if(index<0) return false;
        _bobj.array.splice(index,0);
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
        this.data[label].array.forEach((value)=>{
            cb(value,index,label,diffLb);
            diffLb=false;
            index++;
        });
        return index;
    }


    _forEachAll(cb){
        let bkeys = Object.keys(this.data);
        let index=0;
        bkeys.forEach((label)=>{
            index=this.forEachValues(label,cb,index);
        });
    }


    fromJson(data){
        this._data = data;
    }


    toJson(){
        return this._data;
    }
}

module.exports = Bookmarks;