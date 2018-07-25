class Samples {

    constructor(values){
        this._error = true;
        this.values = [];
        this.options = [];
        if(!this.init(values)) return;
        this._error = false;
    }

    isError(){
        return this._error;
    }

    init(values){
        if(!_.isArray(values)) return false;
        this.values = [];
        this.options = [];
        values.forEach(function(v){
            v = _.trim(v);
            if(_.startsWith(v,'-')) this.options.push(v);
            else this.values.push(v);
        });
        return true;
    }

    hasOption(o){
        return (_.indexOf(this.options,'-'+o)>=0);
    }
}