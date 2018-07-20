
class Utils {

    constructor(){ }

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
}

module.exports = new Utils();
