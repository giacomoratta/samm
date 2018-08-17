class CliParams {

    constructor(values){
        if(!values){
            values=process.argv;
            values = _.slice(values,2);
        }
        this._error = true;
        this.command = '';
        this._argv =  [];
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
        this._argv =  values;
        this.values = [];
        this.options = [];
        this.options_kv = {};
        values.forEach(function(v){
            v = _.trim(v);
            if(_.startsWith(v,'-')){
                let _split = v.split('=');
                if(_split.length>1){
                    _this.options.push(_split[0]);
                    _this.options_kv[_split[0]]=_.join(_.slice(_split,1));
                }else{
                    _this.options.push(v);
                }
            }
            else _this.values.push(v);
        });
        this.command = this.values[0];
        this.values = _.slice(this.values,1);
        return true;
    }

    commandIs(c){
        return (c==this.command);
    }

    hasValues(c){
        return (this.values.length>0);
    }

    hasOptions(c){
        return (this.options.length>0);
    }

    hasOption(o){
        return (_.indexOf(this.options,o)>=0 || _.indexOf(this.options,'-'+o)>=0);
    }

    getOption(o){
        if(_.indexOf(this.options,o)>=0) return this.options_kv[o];
        if(_.indexOf(this.options,'-'+o)>=0) return this.options_kv['-'+o];
        return null;
    }

    get(i){
        if(!_.isNil(this.values[i])) return this.values[i];
        return null;
    }

    getValues(start,end){
        if(_.isNil(start) && _.isNil(end)) return this.values;
        return _.slice(this.values,start,end);
    }
}

module.exports = CliParams;