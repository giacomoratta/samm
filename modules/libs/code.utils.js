const libUtils = {}

libUtils.newFunction = () => {
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

module.exports = libUtils
