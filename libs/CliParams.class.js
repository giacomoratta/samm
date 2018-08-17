class CliParams {

    constructor(values, command){
        this.init(values,command);
    }

    isError(){
        return this._error;
    }

    // parseParameters(values){
    //     if(_.isString(values)) {
    //         values = Utils.replaceAll(values,'"','');
    //         return minimist(stringArgv(values));
    //     }
    //     if(_.isArray(values)) {
    //         return minimist(values);
    //     }
    //     if(!values){
    //         values=process.argv;
    //         values = _.slice(values,2);
    //         return minimist(values);
    //     }
    // }

    // _old_init(values){
    //     this._error = true;
    //     this.command = null;
    //     this.params =  { _:[] };
    //
    //     let p_values = this.parseParameters(values);
    //     if(!_.isObject(p_values)) return;
    //
    //     this.command = (p_values._.length>0 ? p_values._[0] : null);
    //     p_values._   = (p_values._.length>0 ? p_values._[0] : null);
    //     this.options_count = Math.max(Object.keys(p_values)-1,0);
    //     this.params = p_values;
    //     this._error = false;
    // }

    init(values, command){
        this._error = true;
        this.command = null;
        this.params =  { _:[] };
        if(!_.isObject(values)) return;

        this.command = command;
        this.options = values.options;
        this.options_count = Object.keys(values.options).length;
        delete values.options;
        this.params_count = Object.keys(values).length;
        this.params = values;
        this._error = false;

        /*
        this.params has the same data-format returned by minimist library.
        {
            _: [ array of values ],
            opt1: true (if does not have a value, just to check the presence)
            opt2: 'value',
            opt2: 12321, (already converted)
            opt2: 123.21
        }
        */
    }


    commandIs(c){
        return (c==this.command);
    }


    hasValues(c){
        return (this.params_count);
    }

    hasOptions(){
        return (this.options_count);
    }

    hasOption(o){
        return (!_.isNil(this.options[o]));
    }


    get(i){
        if(!_.isNil(this.params[i])) return this.params[i];
        return null;
    }

    getValues(start,end){
        //if(_.isNil(start) && _.isNil(end)) return this.params._;
        //return _.slice(this.params._,start,end);
    }

    getOption(o){
        if(!_.isNil(this.options[o])) return this.options[o];
        return null;
    }
}

module.exports = CliParams;