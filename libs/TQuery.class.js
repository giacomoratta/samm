class TQuery {

    constructor(){
        this._data = {};
        this._size = 0;
    }

    _newTQueryNode(tag,query){
        return {
            tag:tag,
            query:query
        }
    }

    empty(){
        return (this._size===0);
    }

    size(){
        return this._size;
    }

    get(tag){
        let tquery = this._data[tag];
        if(!tquery) return;
        return tquery.query;
    }

    add(tag,query){
        if(!_.isString(tag) || !_.isString(query)) return false;
        if(!this._data[tag]) this._size++;
        this._data[tag] = this._newTQueryNode(tag,query);
        return true;
    }

    remove(tag){
        if(!_.isString(tag)) return false;
        delete this._data[tag];
        this._size--;
        return true;
    }

    forEach(cb){
        let keys = Object.keys(this._data);
        for(let i=0; i<keys.length; i++){
            cb(keys[i],this._data[keys[i]].query);
        }
    }

    getTags(){
        return Object.keys(this._data);
    }

    getAsPlainObject(){
        let _obj = {};
        this.forEach(function(k,v){
            _obj[k]=v;
        });
    }

    fromJson(jsondata){
        this._data = {};
        this._size = jsondata.size;
        let keys = Object.keys(jsondata.collection);
        for(let i=0; i<keys.length; i++){
            this._data[keys[i]] = this._newTQueryNode(keys[i],jsondata.collection[keys[i]].query);
        }
        return true;
    }


    toJson(){
        return {
            size:this._size,
            collection:this._data
        };
    }
}

module.exports = TQuery;