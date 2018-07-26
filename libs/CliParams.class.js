class CliParams {

    constructor(values){
        this._error = true;
        this.command = '';
        this.values = [];
        this.options = [];
        if(!this.init(values)) return;
        this._error = false;
    }

    isError(){
        return this._error;
    }

    init(values){
        if(!_.isArray(values) || values.length<=0) return false;
        let _this=this;
        this.command = '';
        this.values = [];
        this.options = [];
        values.forEach(function(v){
            v = _.trim(v);
            if(_.startsWith(v,'-')) _this.options.push(v);
            else _this.values.push(v);
        });
        this.command = this.values[0];
        this.values = _.slice(this.values,1);
        return true;
    }

    commandIs(c){
        return (c==this.command);
    }

    hasOption(o){
        return (_.indexOf(this.options,'-'+o)>=0);
    }
}

module.exports = CliParams;