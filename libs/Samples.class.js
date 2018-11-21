class Samples{

    constructor(absPath, tagQuery, options){
        this._options = _.merge({
            opposite_matching:false     // if ture, add items which do not match with tag check fn()
        },options);

        this._error = false;
        this._origin_path = absPath;
        this._ptags_obj = (_.isString(tagQuery)?Samples.processTagString(tagQuery):null);
        this._array = [];

        if(!_.isString(this._origin_path) ||
            (_.isString(tagQuery) && !_.isObject(this._ptags_obj))
        ){
            this._error = true;
            return;
        }
    }

    createFromThis(copy){
        let newobj = new this.constructor();
        newobj._error = false;
        newobj._origin_path = this._origin_path;
        newobj._ptags_obj = this._ptags_obj;
        newobj._array = [];
        if(copy===true){
            this.forEach((v,i)=>{
                newobj.add(v);
            });
        }
        return newobj;
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
            label:"",
            short_label:"",
            check_fn:function(){ return true; },
        };
        let proc_obj = {
            _string:[],         // temporary array with strings e.g. ['a+b+c','d+e']
            string:"",          // final tag processed query
            array:[],           // array with subarrays of separated tags
            label:"",           // label with all tags
            short_label:"",     // short version of this.label
            check_fn:null,      // function used to check the filename
            _check_fn_string:"" // temporary string with composed function which is evaluated
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

        /* Setting the label */
        proc_obj.array.forEach(function(v){ proc_obj.label += _.join(v,'_')+'_'; });
        proc_obj.label = proc_obj.label.slice(0,-1);
        proc_obj.short_label = proc_obj.label.substr(0,22);
        if(proc_obj.short_label.length>21) proc_obj.short_label = proc_obj.short_label.substr(0,proc_obj.short_label.lastIndexOf('_'));

        delete proc_obj._string;
        delete proc_obj._check_fn_string;
        return proc_obj;
    }


    error(){
        return (this._error);
    }

    empty(){
        return (this._array.length===0);
    }

    size(){
        return this._array.length;
    }

    getOriginPath(){
        return this._origin_path;
    }

    _add(item,no_clones){
        if(no_clones===true){
            for(let i=0, f=false; i<this._array.length; i++){
                if(item.isEqualTo(this._array[i])) return false;
            }
        }
        this._array.push(item);
        return true;
    }

    _remove(item){
        let index = -1;
        if(_.isObject(item)){
            for(let i=0; i<this._array.length; i++){
                if(this._array[i].isEqualTo(item)){
                    index = i;
                    break;
                }
            }
        }
        if(index===-1 || !this._array[index]) return false;
        this._array.splice(index,1);
        return true;
    }

    add(item,no_clones){
        if(!item.isFile) return;
        if(!this._ptags_obj){
            return this._add(item,no_clones);

        } else if(this._ptags_obj.check_fn(_.toLower(item.rel_path)) !== this._options.opposite_matching){
            return this._add(item,no_clones);
        }
        return false;
    }

    remove(item){
        return this._remove(item);
    }

    get(index){
        return this._array[index];
    }

    set(item, index){
        this._array[index] = item;
    }



    getQueryTag(){
        if(!this._ptags_obj) return '';
        return this._ptags_obj.string;
    }

    getTagLabel(){
        if(!this._ptags_obj) return '';
        return this._ptags_obj.label;
    }

    getTagShortLabel(){
        if(!this._ptags_obj) return '';
        return this._ptags_obj.short_label;
    }


    isEqualTo(smp_obj){
        if(smp_obj._array.length != this._array.length) return false;
        let eq=true;
        for(let i=0; i<smp_obj._array.length; i++){
            if(smp_obj._array[i].isEqualTo(this._array[i])){
                eq=false;
                break;
            }
        }
        return eq;
    }


    forEach(callback){
        //callback(item,index)
        // ...if return the item object, the data will be modified with its values
        for(let i=0, item_ref=null; i<this._array.length; i++){
            item_ref = callback(this._array[i],i);
            if(item_ref) this._array[i] = item_ref;
        }
    }


    print(prefix,processFn){
        let padding = (""+this.size()+"").length+2;
        if(!processFn) processFn=function(n){ return n; };
        if(!prefix) prefix='';
        this.forEach(function(item,index){
            console.log(prefix+_.padStart((index+1)+')', padding)+" "+processFn(item.rel_path));
        });
    }


    getRandom(count, max_occur, adapt_window){
        // Return a copy if found less files than count
        if(this.size()<=count) return this.createFromThis(true /* copy items */);

        let _sameDirectoryMaxOccurs = function(item,o_obj,max_o){
            let f_path = item.dir;
            if(!o_obj[f_path]) o_obj[f_path]=0;
            else if(o_obj[f_path]>=max_o) return true;
            o_obj[f_path]++;
            return false;
        };

        if(!_.isBoolean(adapt_window)) adapt_window=true;
        let max_attempts=(adapt_window?10:1);

        if(!_.isInteger(count) || count<=1) count=10;
        let size = this.size();
        let rf, rn, r_array=[];
        let occur_obj = {};
        if(_.isNil(max_occur)) max_occur=-1;

        // New object for random samples
        let smp_obj_random = this.createFromThis();

        while(max_attempts>0){
            let i=0, sec=size;
            while(i<count && sec>0){
                sec--;
                rn=((_.random(0,size))%size);

                if(r_array.indexOf(rn)>=0) continue;

                rf=this.get(rn);
                if(_sameDirectoryMaxOccurs(rf, occur_obj, max_occur)){
                    continue;
                }
                if(smp_obj_random._add(rf)===true){
                    r_array.push(rn);
                }

                if(smp_obj_random.size()>=count) break;
                i++;
            }

            if(smp_obj_random.size()>=count) break;
            max_occur++;
            max_attempts--;
        }
        return smp_obj_random;
    }



}

module.exports = Samples;
