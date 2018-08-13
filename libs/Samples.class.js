
class Samples {

    constructor(){
        this.init();
    }


    init(){
        this.tags = [];
        this.array = [];
        this.array_normalized = [];
        this.random = []; //TODO:remove; after set random, array should be replaced with random
    }

    isEmpty(){
        return !(this.array.length>0 && this.random.length>0);
    }

    size(){
        return this.array.length;
    }

    add(sample_path){
        this.array.push(sample_path);
        this.array_normalized.push(_.toLower(sample_path));
    }

    copyItem(obj,index){
        this.array.push(obj.array[index]);
        this.array_normalized.push(obj.array_normalized[index]);
    }

    get(index){
        return this.array[index];
    }

    getNormalized(index){
        return this.array_normalized[index];
    }

    copy(clone){
        //clone=false (default) => shallow copy
    }

    compare(smp_obj){

    }

    compareSample(index,sample_path){

    }

    forEach(callback){
        //callback(value,normalized,index)
    }

    sort(){
        //Utils.sortFilesArray(r_array);
        //manage items with array of objects
    }


    toTextAll(){
        let text_to_file = _.join(this.array,"\n");
        text_to_file = _.join(this.tags,", ")+"\n\n"+text_to_file;
        return text_to_file;
    }


    toText(){
        let text_to_file = _.join(this.random,"\n");
        text_to_file = _.join(this.tags,", ")+"\n\n"+text_to_file;
        return text_to_file;
    }


    fromText(text){
        this.init();
        if(!_.isString(text)) return false;
        let file_rows = _.split(_.trim(text),"\n");
        if(!_.isArray(file_rows) || file_rows.length<5) return false;

        this.tags = _.split(file_rows[0],',');
        for(let i=2; i<file_rows.length; i++){
            this.add(file_rows[i]);
        }
        return true;
    }


    toJsonString(){
        let obj_save = { array: this.array }
        let json_string = JSON.stringify(obj_save);
        return json_string;
    }


    fromJsonString(json_string){
        this.init();
        if(!_.isString(json_string)) return false;
        json_string = _.trim(json_string);
        try{
            let _self = this;
            let json_obj = JSON.parse(json_string);
            json_obj.array.forEach(function(v){
                _self.add(v);
            });
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }


    getRandom(count,max_occur){
        let local_path = path;
        if(this.array.length>0 && this.array[0].indexOf('\\')>0) local_path=path.win32; //TODO:remove

        let _sameDirectoryMaxOccurs = function(f,o_obj,max_o){
            let f_path = local_path.win32.dirname(f);
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

        let smp_obj_random = new Samples(); //TODO: improve

        while(i<count && sec>0){
            sec--;
            rn=((_.random(0,size)*7)%size);
            rf=this.get(rn);
            if(_sameDirectoryMaxOccurs(rf,occur_obj,max_occur)){
                continue;
            }
            smp_obj_random.copyItem(this,rn);
            i++;
        }
        smp_obj_random.sort();
        return smp_obj_random;
    }
}

module.exports = Samples;
