
class Samples {

    constructor(){
        this.init();
    }


    init(){
        this._tags = [];
        this._array = [];
        this._n_array = [];
        this._origin_path = null;
    }

    empty(){
        return !(this._array.length>0);
    }

    size(){
        return this._array.length;
    }

    getOriginPath(){
        return this._origin_path;
    }

    setOriginPath(path){
        this._origin_path = path;
    }

    getTags(){
        return this._tags;
    }

    getTagLabel(){
        return _.join(this._tags,'_');
    }

    setTags(tagsArray){
        if(!_.isArray(tagsArray)) return;
        let _ta = tagsArray;
        if(_.isArray(tagsArray[0])){
            _ta = [];
            tagsArray.forEach(function(c){
                c.forEach(function(v){
                    _ta.push(v);
                })
            })
        };
        this._tags = _ta;
    }

    add(sample_path){
        this._array.push(sample_path);
        this._n_array.push(_.kebabCase(sample_path));
    }

    get(index){
        return this._array[index];
    }

    set(sample_path, index){
        this._array[index] = sample_path;
        this._n_array[index] = _.toLower(sample_path);
    }

    addItem(item){
        this._array.push(item.path);
        this._n_array.push(item.n_path);
    }

    getItem(index){
        return {
            path:this._array[index],
            n_path:this._n_array[index]
        };
    }

    setItem(item,index){
        this._array[index]=item.path;
        this._n_array[index]=item.n_path;
    }

    copy(clone){
        //clone=false (default) => shallow copy
    }

    isEqual(smp_obj){
        if(smp_obj._array.length != this._array.length) return false;
        let eq=true;
        for(let i=0; i<smp_obj._array.length; i++){
            if(smp_obj._array[i]!=this._array[i]){
                eq=false;
                break;
            }
        }
        return eq;
    }

    compareSample(index,sample_path){

    }

    forEach(callback){
        //callback(item,index)
        // ...if return the item object, the data will be modified with its values
        for(let i=0, item_ref=null; i<this.size(); i++){
            item_ref = callback(this.getItem(i),i);
            if(item_ref) this.set(item_ref,i);
        }
    }

    sort(){
        let _self = this;
        Utils.sortParallelFileArrays(this._array,function(old_index,new_index){
            let tmp = _self._n_array[old_index];
            _self._n_array[old_index] = _self._n_array[new_index];
            _self._n_array[new_index] = tmp;
        });
    }


    toJsonString(){
        let json_string = JSON.stringify({
            tags: this._tags,
            origin_path: this._origin_path,
            collection: this._array
        });
        return json_string;
    }


    fromJsonString(json_string){
        this.init();
        if(!_.isString(json_string)) return false;
        json_string = _.trim(json_string);
        try{
            let _self = this;
            let json_obj = JSON.parse(json_string);
            json_obj.collection.forEach(function(v){
                _self.add(v);
            });
            _self._tags = json_obj.tags;
            _self._origin_path = json_obj.origin_path;
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }


    getRandom(count,max_occur){
        let local_path = Utils.File._path; // TODO:remove
        if(this._array.length>0 && this._array[0].indexOf('\\')>0) local_path=Utils.File._path.win32; //TODO:remove

        let _sameDirectoryMaxOccurs = function(f,o_obj,max_o){
            let f_path = local_path.dirname(f); //TODO:replace with > let f_path = Utils.File.pathDirname
            if(!o_obj[f_path]) o_obj[f_path]=0;
            else if(o_obj[f_path]>=max_o) return true;
            o_obj[f_path]++;
            return false;
        };

        if(!_.isInteger(count) || count<=1) count=10;
        let r_array = [];
        let size = this.size();
        let i=0, sec=size, rf, rn;
        let occur_obj = {};
        if(_.isNil(max_occur)) max_occur=-1;

        // New object for random samples
        let smp_obj_random = new this.constructor();

        while(i<count && sec>0){
            sec--;
            rn=((_.random(0,size)*7)%size);
            rf=this.getItem(rn);
            if(_sameDirectoryMaxOccurs(rf.path,occur_obj,max_occur)){
                continue;
            }
            smp_obj_random.addItem(rf);
            i++;
        }
        smp_obj_random.sort();
        return smp_obj_random;
    }


    print(prefix,processFn){
        let padding = (""+this.size()+"").length+1;
        if(!processFn) processFn=function(n){ return n; };
        if(!prefix) prefix='';
        this.forEach(function(item,index){
            console.log(prefix+_.padStart((index+1)+')', padding)+" "+processFn(item.path));
        });
    }
}

module.exports = Samples;
