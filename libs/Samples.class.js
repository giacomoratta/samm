
class Samples {

    constructor(){
        this.init();
    }


    init(){
        this.tags = [];
        this.array = [];
        this.random = [];
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

        this.tags = _.split(file_rows[0],', ');
        for(let i=2; i<file_rows.length; i++){
            this.array.push(file_rows[i]);
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
            let json_obj = JSON.parse(json_string);
            this.array = json_obj.array;
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }


    setRandom(count,max_occur){
        let local_path = path;
        if(this.array.length>0 && this.array[0].indexOf('\\')>0) local_path=path.win32;

        let _sameDirectoryMaxOccurs = function(f,o_obj,max_o){
            let f_path = local_path.win32.dirname(f);
            if(!o_obj[f_path]) o_obj[f_path]=0;
            else if(o_obj[f_path]>=max_o) return true;
            o_obj[f_path]++;
            return false;
        };

        if(!_.isInteger(count) || count<=1) count=10;
        let r_array = [];
        let size = this.array.length;
        let i=0, sec=size, rf, rn;
        let occur_obj = {};
        if(_.isNil(max_occur)) max_occur=-1;
        while(i<count && sec>0){
            sec--;
            rn=((_.random(0,size)*7)%size);
            rf=this.array[rn];
            if(_sameDirectoryMaxOccurs(rf,occur_obj,max_occur)){
                //d(sec,i,count,'jump',rf);
                continue;
            }
            r_array.push(rf);
            //console.log("   - ",'...'+rf.substring(16));
            console.log("   - ",rf);
            i++;
        }
        this.random = Utils.sortFilesArray(r_array);
        return this.random;
    }
}

module.exports = Samples;
