const _ = require('lodash');

class Utils {

    constructor(){
        this.File = require('./extensions/Utils.File');
        this.Date = require('./extensions/Utils.Date');
        this.String = require('./extensions/Utils.String');
        this.SystemInfo = require('./extensions/Utils.SystemInfo');
        this.Network = require('./extensions/Utils.Network');
    }

    EXIT(message,data){
        if(message) console.log("\n"+message);
        if(data) console.log(data);
        console.log("Process terminated.\n");
        process.exit(0);
    }


    sortFilesArray(array){
        array.sort(function(a,b){
            let a_name = _.toLower(a);
            let b_name = _.toLower(b);
            if(a_name<b_name) return -1;
            if(a_name>b_name) return 1;
            return 0;
        });
        return array;
    }


    sortParallelArrays(array, compare_fn, swap_fn){
        if(!compare_fn) compare_fn=function(){};
        if(!swap_fn) swap_fn=function(){};
        for(let i=0,j=0,tmp=null; i<array.length-1; i++){
            for(j=i+1; j<array.length; j++){
                if(compare_fn(array[i],array[j])>0){
                    tmp = array[i];
                    array[i] = array[j];
                    array[j] = tmp;
                    swap_fn(i /*old index*/, j /*new index*/, array[i], array[j]);
                }
            }
        }
        return array;
    }

    sortParallelFileArrays(array, swap_fn){
        this.sortParallelArrays(array,function(a,b){
            let a_name = _.toLower(a);
            let b_name = _.toLower(b);
            if(a_name<b_name) return -1;
            if(a_name>b_name) return 1;
            return 0;
        },swap_fn);
        return array;
    }

    sortObjectByValue(obj){
        return _(obj).toPairs().sortBy(1).fromPairs().value();
    }

    sortObjectByKey(obj){
        return _(obj).toPairs().sortBy(0).fromPairs().value();
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
            d$(e);
            return null;
        }
        return null;
    }

    onlyLettersNumbers(s){
        return s.replace(/[^a-zA-Z0-9]/g,'');
    }

    onlyValidPathName(s){
        return s.replace(/[^a-zA-Z0-9\_\-\.]/g,'');
    }

    printArrayOrderedList(array,prefix,processFn){
        let padding = (""+array.length+"").length+1;
        if(!processFn) processFn=function(n){ return n; };
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

    strToBoolean(s){
        s = _.trim(s);
        if(s.length<=0) return null;
        s = _.toLower(s);
        let n = null;
        if(s==="true"  || s==="1" || s==="y") n=true;
        if(s==="false" || s==="0" || s==="n") n=false;
        return n;
    }

    strToString(s){
        if(!_.isString(s)) return null;
        s = _.trim(s);
        if(s.length<=0) return null;
        return s;
    }

    searchInObjectArray(array,key,value){
        for(let i=0; i<array.length; i++){
            if(array[i][key]==value) return true;
        }
        return false;
    }

    shuffleArray(array) {
        let cindex = array.length, tempv, rindex;
        // While there remain elements to shuffle...
        while (0 !== cindex) {
            // Pick a remaining element...
            rindex = Math.floor(Math.random() * cindex);
            cindex -= 1;
            // And swap it with the current element.
            tempv = array[cindex];
            array[cindex] = array[rindex];
            array[rindex] = tempv;
        }
        return array;
    }
}

module.exports = new Utils();
