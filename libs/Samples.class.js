
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
        let json_string = JSON.stringify(this.array, null, '  ');
        return json_string;
    }


    fromJsonString(json_string){
        this.init();
        if(!_.isString(json_string)) return false;
        try{
            this.array = JSON.parse(json_string);
        }catch(e){
            console.log(e);
            return false;
        }
        return true;
    }


    setRandom(count){
        let _sameDirectoryMaxOccurs = function(arr,f,o_obj,max_o){
            let f_path = path.dirname(f);
            for(let i=0; i<arr.length; i++){
                let arrf_path = path.dirname(arr[i]);
                if(f_path == arrf_path){
                    if(!_.isObject(o_obj) || !_.isInteger(max_o)) return true;
                    if(_.isNil(o_obj[f_path])) o_obj[f_path]=0;
                    if(o_obj[f_path]>=max_o) return true;
                    o_obj[f_path]++;
                    return false;
                }
            }
            return false;
        };

        if(!_.isInteger(count) || count<=1) count=10;
        let r_array = [];
        let size = this.array.length;
        let i=0, sec=size, rf, rn;
        let occur_obj = {};
        let max_occur = 2;
        while(i<count && sec>0){
            sec--;
            rn=_.random(0,size);
            rn=((rn*7)%size);
            rf=this.array[rn];
            if(_sameDirectoryMaxOccurs(r_array,rf,occur_obj,max_occur)) continue;
            r_array.push(rf);
            console.log("   - ",rf);
            i++;
        }
        return Utils.sortFilesArray(r_array);
    }
}

module.exports = Samples;
