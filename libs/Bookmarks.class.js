class Bookmarks {

    constructor(){
        this._data = {
            _:this._newBookmNode()
        }
    }


    _newBookmNode(){
        return {
            _info:{},
            _array:[]
        };
    }


    add(bdata,label){

    }


    remove(bdata,label){

    }


    print(){

    }


    fromJson(data){
        this._data = data;
    }


    toJson(){
        return this._data;
    }
}

module.exports = Bookmarks;