class QTags {

    constructor(){
        this._data = {};
        this._size = 0;
    }

    _newQTagsNode(tag,query){
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
        let qtag = this._data[label];
        if(!qtag) return;
        return qtag.query;
    }

    add(tag,query){
        if(!_.isString(tag) || !_.isString(query)) return false;
        this._data[tag] = this._newQTagsNode(tag,query);
        return true;
    }

    remove(tag){
        if(!_.isString(tag)) return false;
        delete this._data[tag];
        return true;
    }


    forEach(cb){
        let keys = Object.keys(this._data);
        for(let i=0; i<keys.length; i++){
            cb(keys[i],this._data[keys[i]].query);
        }
    }


    fromJson(jsondata){
        this._data = {};
        this._size = jsondata.size;
        let keys = Object.keys(jsondata.collection);
        for(let i=0; i<keys.length; i++){
            this._data[keys[i]] = this._newQTagsNode(keys[i],jsondata.collection[keys[i]]);
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

module.exports = QTags;