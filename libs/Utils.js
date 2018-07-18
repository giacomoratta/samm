
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

module.exports = new Utils();
