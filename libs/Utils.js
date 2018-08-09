class Utils {

    constructor(){
        this._abspath = process.cwd()+path.sep;
        this.File = require('./Utils.File');
    }

    abspath(){
        return this._abspath;
    }

    EXIT(message){
        console.log("\n\n"+message+"\n\nProcess terminated.\n\n");
        process.exit(0);
    }

    sortFilesArray(arr){
        return arr.sort(function(a,b){
            let a_name = _.toLower(a);
            let b_name = _.toLower(b);
            if(a_name<b_name) return -1;
            if(a_name>b_name) return 1;
            return 0;
        });
    }

    replaceAll(str, str1, str2, ignore){
        return str.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
    }

    newFunction(){
        try{
            function F(args) { return Function.apply(this, args); }
            F.prototype = Function.prototype;
            return new F(arguments);
        }catch(e){
            //console.log(e);
            return null;
        }
        return null;
    }

    onlyLettersNumbers(s){
        return s.replace(/[^a-zA-Z0-9]/g,'');
    }

    printArrayOrderedList(array,prefix,processFn){
        let padding = (""+array.length+"").length+1;
        if(!processFn) SamplesDirectory=function(n){ return n; };
        if(!prefix) prefix='';
        array.forEach(function(v,i,a){
            console.log(prefix+_.padStart((i+1)+')', padding)+" "+processFn(v));
        });
    }

    strToInteger(s){
        if(!_.isString(s)) return null;
        s = _.trim(s);
        if(s.length<=0) return null;
        let n = parseInt(s);
        if(_.isNil(n) || _.isNaN(n) || ""+n+""!=s) return null;
        return n;
    }

    strToFloat(s){
        if(!_.isString(s)) return null;
        s = _.trim(s);
        if(s.length<=0) return null;
        let n = parseFloat(s);
        if(_.isNil(n) || _.isNaN(n) || ""+n+""!=s) return null;
        return n;
    }

    strToString(s){
        if(!_.isString(s)) return null;
        s = _.trim(s);
        if(s.length<=0) return null;
        return s;
    }
}

module.exports = new Utils();
