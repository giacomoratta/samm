global._.mixin({ 'isPromise':(obj)=>{
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}});


global._.mixin({ 'readyPromise':(data)=>{
    return new Promise(function(res,rej){ res(data); return; });
}});


global._.mixin({ 'noDuplicatedValues':(array,value,cb)=>{
    if(!_.isFunction(cb)) cb=function(value, changed_value, index, array){
        if(_.indexOf(array,changed_value)<0) return true;
        return value+'_'+index;
    };
    let _limit=100000;
    let index=0;
    let new_value=value;
    let new_value_check=new_value;

    while(_limit>index){
        index++;
        new_value_check = cb(value, new_value, index, array);
        if(new_value_check===true) return new_value; //found a free value
        new_value = new_value_check;
    }
    return null;
}});