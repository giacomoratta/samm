class SamplesTree {

    constructor(absPath, ST_options, DT_options){
        this._tags = [];
        this._query_tag = '';
        this.T = new DirectoryTree(absPath,DT_options);
    }

    empty(){
    }

    size(){
        return this.T.fileCount();
    }

    error(){
        return this.T.error();
    }

    getOriginPath(){
        return this._origin_path;
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
    }


    fromJsonString(json_string){
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


    /**
     * Check and process the tag query string.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param {string} ts
     * @returns { object | null }
     */
    processTagString(ts, splitFn){
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
        if(!_.isArray(tagOR) || tagOR.length<=0) return null;
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
        if(!proc_obj.check_fn) return null;

        delete proc_obj._string;
        delete proc_obj._check_fn_string;
        return proc_obj;
    }



    /**
     * Perform a search by tags.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param tagString
     * @returns { Samples | null }
     */
    searchSamplesByTags(smp_obj_scan, tagString){
        let smp_obj = new Samples();
        let ptags_obj = this.processTagString(tagString);
        if(!ptags_obj) return null;

        let attempts = 5;
        let _MaxOccurrencesSameDirectory = ConfigMgr.get('MaxOccurrencesSameDirectory');
        let _RandomCount = ConfigMgr.get('RandomCount');
        let smp_obj_random = null;

        while(attempts>0){
            smp_obj.init();
            smp_obj_scan.forEach(function(item,index){
                if(ptags_obj.check_fn(item.n_path)){
                    smp_obj.addItem(item);
                }
            });
            if(smp_obj.empty()) return smp_obj;

            smp_obj_random = smp_obj.getRandom(_RandomCount, _MaxOccurrencesSameDirectory);
            if(smp_obj_random && smp_obj_random.size()>=_RandomCount) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;
        }
        if(!smp_obj_random || smp_obj_random.empty()) return smp_obj_random;
        smp_obj_random.setTags(ptags_obj.array);

        smp_obj_random.print('   ',function(n){ return n.substring(ConfigMgr.get('SamplesDirectory').length); });
        console.log("\n   Performed search: '"+ptags_obj.string+"'");
        console.log(  "   Random selection of "+_RandomCount+" samples","(max "+_MaxOccurrencesSameDirectory+" from the same directory)");
        //d(smp_obj_random);
        return smp_obj_random;
    }
}

module.exports = SamplesTree;
