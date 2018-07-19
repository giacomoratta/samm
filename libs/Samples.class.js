
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
}

module.exports = Samples;
