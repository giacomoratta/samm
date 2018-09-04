class Samples{

    constructor(absPath, tagQuery){
        this._error = false;
        this._origin_path = absPath;
        this._ptags_obj = Samples.processTagString(tagQuery);
        this._array = [];

        if(!_.isString(this._origin_path) || !_.isObject(this._ptags_obj)){
            this._error = true;
            return;
        }
    }


    /**
     * Check and process the tag query string.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param {string} ts
     * @returns { object | null }
     */
    static processTagString(ts, splitFn){
        let proc_obj_empty = {
            string:"",
            array:[],
            check_fn:function(){ return true; },
        };
        let proc_obj = {
            _string:[],  //temporary array with strings e.g. ['a+b+c','d+e']
            string:"",  //final tag processed query
            array:[],   //array with subarrays of separated tags
            check_fn:null,  //function used to check the filename
            _check_fn_string:"" //temporary string with composed function which is evaluated
        };
        ts = _.toLower(ts).replace(/[^a-zA-Z0-9\s +,]/g,'');

        let _setSeparateAndFunctions = function(){};
        if(_.isArray(splitFn)){
            _setSeparateAndFunctions = function(string,tag_array,fn_body){
                if(Utils.searchInObjectArray(splitFn,'string',string)===true) return; //avoid duplicates
                splitFn.push({
                    string:string,
                    tag_array:tag_array,
                    check_fn:Utils.newFunction('f',fn_body)
                });
            };
        }

        /* Split tags and shuffle */
        let tagOR = _.split(ts,',');
        if(!_.isArray(tagOR) || tagOR.length<=0) return proc_obj_empty;
        tagOR = _.shuffle(tagOR);

        /* Writing new function */
        tagOR.forEach(function(v1,i1,a1){
            v1=_.trim(v1);
            if(v1.length<=0) return;

            let _this_string, _this_fn_IF;
            let tagAND=_.split(v1,'+');
            proc_obj.array.push([]);
            let po_index = proc_obj.array.length-1;

            tagAND.forEach(function(v2,i2,a2){
                v2=_.trim(v2);
                if(v2.length<=0) return;
                a2[i2]=_.trim(a2[i2]);
                proc_obj.array[po_index].push(a2[i2]);
            });
            if(tagAND.length<=0) return;

            _this_fn_IF = "( f.indexOf('"+ _.join(tagAND,"')>=0 && f.indexOf('") +"')>=0 )";
            _this_string = _.join(tagAND,"+");

            proc_obj._check_fn_string+="if "+_this_fn_IF+" return true;\n";
            proc_obj._string.push(_this_string);

            _setSeparateAndFunctions(_this_string, tagAND, "return "+_this_fn_IF+"; ");
        });

        proc_obj.string = _.join(proc_obj._string,", ");
        proc_obj._check_fn_string+="return false;\n";

        /* Building new function */
        proc_obj.check_fn = Utils.newFunction('f',proc_obj._check_fn_string);
        if(!proc_obj.check_fn) return proc_obj_empty;

        delete proc_obj._string;
        delete proc_obj._check_fn_string;
        return proc_obj;
    }


    error(){
        return (this._error);
    }

    empty(){
        return (this._array.length==0);
    }

    size(){
        return this._array.length;
    }

    getOriginPath(){
        return this._origin_path;
    }


    add(item){
        if(!item.isFile) return;
        if(this._ptags_obj.check_fn(_.toLower(item.rel_path))){
            this._array.push(item.rel_path);
        }
    }






    /* work in progress * * * * * * * * * * * * * * * * * * * * * * * */


    getTags(){
        return this._ptags_obj; //TODO use _ptags_obj
    }

    getTagLabel(){
        return _.join(this._ptags_obj,'_'); //TODO use _ptags_obj
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
