const libUtils = {}

libUtils.sortFilesArray = (array) => {
    array.sort(function(a,b){
        let a_name = _.toLower(a);
        let b_name = _.toLower(b);
        if(a_name<b_name) return -1;
        if(a_name>b_name) return 1;
        return 0;
    });
    return array;
}


libUtils.sortParallelArrays = (array, compare_fn, swap_fn) => {
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


libUtils.sortParallelFileArrays = (array, swap_fn) => {
    this.sortParallelArrays(array,function(a,b){
        let a_name = _.toLower(a);
        let b_name = _.toLower(b);
        if(a_name<b_name) return -1;
        if(a_name>b_name) return 1;
        return 0;
    },swap_fn);
    return array;
}


libUtils.searchInObjectArray = (array,key,value) => {
    for(let i=0; i<array.length; i++){
        if(array[i][key]==value) return true;
    }
    return false;
}


libUtils.shuffleArray = (array) => {
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


libUtils.printArrayOrderedList = (array,prefix,processFn) => {
    let padding = (""+array.length+"").length+1;
    if(!processFn) processFn=function(n){ return n; };
    if(!prefix) prefix='';
    array.forEach(function(v,i,a){
        console.log(prefix+_.padStart((i+1)+')', padding)+" "+processFn(v));
    });
}

module.exports = libUtils
