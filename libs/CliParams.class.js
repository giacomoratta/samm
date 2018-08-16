const _inc = {};
_inc.stringArgv = require('string-argv');
_inc.minimist = require('minimist');

class CliParams {

    constructor(values){
        this.init(values);
    }

    isError(){
        return this._error;
    }

    parseParameters(values){
        if(_.isString(values)) {
            values = Utils.replaceAll(values,'"','');
            return _inc.minimist(_incstringArgv(values));
        }
        if(_.isArray(values)) {
            return _inc.minimist(values);
        }
        if(!values){
            values=process.argv;
            values = _.slice(values,2);
            return _inc.minimist(values);
        }
    }

    init(values){
        this._error = true;
        this.command = null;
        this.params =  { _:[] };

        let p_values = this.parseParameters(values);
        if(!_.isObject(p_values)) return;

        this.command = (p_values._.length>0 ? p_values._[0] : null);
        p_values._   = (p_values._.length>0 ? p_values._[0] : null);
        this.options_count = Math.max(Object.keys(p_values)-1,0);
        this.params = p_values;
        this._error = false;
    }


    commandIs(c){
        return (c==this.command);
    }


    hasValues(c){
        return (this.params._.length>0);
    }

    hasOptions(){
        return (this.options_count);
    }

    hasOption(o){
        o = _.lowerCase(o);
        return (!_.isNil(this.params[o]));
    }


    get(i){
        if(!_.isNil(this.params._[i])) return this.params._[i];
        return null;
    }

    getValues(start,end){
        if(_.isNil(start) && _.isNil(end)) return this.params._;
        return _.slice(this.params._,start,end);
    }

    getOptionValue(o){
        if(!_.isNil(this.params[o])) return this.params[o];
        return null;
    }
}

module.exports = CliParams;